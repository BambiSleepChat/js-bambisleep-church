import express from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth.js';
import {
  logger,
  trackStripeWebhook,
  trackSecurityEvent,
  stripeSubscriptionsActive,
  stripePaymentValue,
  stripeWebhooksTotal,
} from '../services/telemetry.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create checkout session for subscription
 */
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;

    const session = await stripe.checkout.sessions.create({
      customer: req.user.stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url:
        successUrl ||
        `${req.protocol}://${req.get('host')}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl || `${req.protocol}://${req.get('host')}/stripe/cancel`,
    });

    logger.info('Checkout session created', {
      sessionId: session.id,
      userId: req.user.id,
      priceId: priceId,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    logger.error('Checkout session error', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * Create payment intent for one-time payment
 */
router.post('/create-payment-intent', requireAuth, async (req, res) => {
  try {
    const { amount, currency = 'usd', description } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: req.user.stripeCustomerId,
      description,
      metadata: {
        userId: req.user.id,
      },
    });

    logger.info('Payment intent created', {
      paymentIntentId: paymentIntent.id,
      userId: req.user.id,
      amount: amount,
      currency: currency,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    logger.error('Payment intent error', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

/**
 * Get customer's subscription status
 */
router.get('/subscription-status', requireAuth, async (req, res) => {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: req.user.stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    const hasActiveSubscription = subscriptions.data.length > 0;

    logger.info('Subscription status checked', {
      userId: req.user.id,
      hasActiveSubscription: hasActiveSubscription,
    });

    res.json({
      hasAccess: hasActiveSubscription,
      subscription: hasActiveSubscription ? subscriptions.data[0] : null,
    });
  } catch (error) {
    logger.error('Subscription status error', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

/**
 * Cancel subscription
 */
router.post('/cancel-subscription', requireAuth, async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    logger.info('Subscription cancellation scheduled', {
      subscriptionId: subscriptionId,
      userId: req.user.id,
      cancelAt: subscription.cancel_at,
    });

    res.json({
      message: 'Subscription will be canceled at period end',
      subscription,
    });
  } catch (error) {
    logger.error('Subscription cancellation error', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

/**
 * Webhook endpoint for Stripe events
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      stripeWebhooksTotal.inc({ event_type: event.type, status: 'verified' });
    } catch (err) {
      logger.error('Webhook signature verification failed', {
        error: err.message,
        eventType: 'unknown',
      });
      trackSecurityEvent('stripe_webhook_verification_failed', 'high', {
        error: err.message,
        ip: req.ip,
      });
      stripeWebhooksTotal.inc({ event_type: 'unknown', status: 'failed' });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        trackStripeWebhook('payment_intent.succeeded', 'success');
        stripePaymentValue.inc(
          { currency: paymentIntent.currency },
          paymentIntent.amount / 100
        );
        logger.info('PaymentIntent succeeded', {
          paymentIntentId: paymentIntent.id,
          customer: paymentIntent.customer,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
        });
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        trackStripeWebhook(event.type, 'success');
        if (event.type === 'customer.subscription.created') {
          stripeSubscriptionsActive.inc();
        }
        logger.info(`Subscription ${event.type}`, {
          subscriptionId: subscription.id,
          customer: subscription.customer,
          status: subscription.status,
          planId: subscription.items.data[0]?.price.id,
        });
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        trackStripeWebhook('customer.subscription.deleted', 'success');
        stripeSubscriptionsActive.dec();
        logger.warn('Subscription canceled', {
          subscriptionId: deletedSubscription.id,
          customer: deletedSubscription.customer,
          canceledAt: new Date(
            deletedSubscription.canceled_at * 1000
          ).toISOString(),
        });
        break;

      case 'invoice.payment_failed':
        const invoice = event.data.object;
        trackStripeWebhook('invoice.payment_failed', 'failed');
        trackSecurityEvent('stripe_payment_failure', 'medium', {
          customerId: invoice.customer,
          invoiceId: invoice.id,
          attemptCount: invoice.attempt_count,
          amount: invoice.amount_due / 100,
        });
        logger.error('Payment failed for invoice', {
          invoiceId: invoice.id,
          customer: invoice.customer,
          attemptCount: invoice.attempt_count,
          amountDue: invoice.amount_due / 100,
        });
        break;

      default:
        trackStripeWebhook(event.type, 'unhandled');
        logger.warn('Unhandled webhook event', {
          eventType: event.type,
          eventId: event.id,
        });
    }

    res.json({ received: true });
  }
);

/**
 * Success page after checkout
 */
router.get('/success', (req, res) => {
  res.render('stripe-success', {
    title: 'Welcome to the Sanctuary',
    sessionId: req.query.session_id,
  });
});

/**
 * Cancel page
 */
router.get('/cancel', (req, res) => {
  res.render('stripe-cancel', {
    title: 'Payment Canceled',
  });
});

export default router;
