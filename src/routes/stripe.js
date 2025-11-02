import express from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth.js';

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
      success_url: successUrl || `${req.protocol}://${req.get('host')}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.protocol}://${req.get('host')}/stripe/cancel`,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
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
        userId: req.user.id
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent error:', error);
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
      limit: 1
    });

    const hasActiveSubscription = subscriptions.data.length > 0;
    
    res.json({
      hasAccess: hasActiveSubscription,
      subscription: hasActiveSubscription ? subscriptions.data[0] : null
    });
  } catch (error) {
    console.error('Subscription status error:', error);
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
      cancel_at_period_end: true
    });

    res.json({
      message: 'Subscription will be canceled at period end',
      subscription
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

/**
 * Webhook endpoint for Stripe events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
      // TODO: Provision access, send confirmation email
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      console.log(`Subscription ${event.type}: ${subscription.id}`);
      // TODO: Update user access in database
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      console.log(`Subscription canceled: ${deletedSubscription.id}`);
      // TODO: Revoke user access
      break;

    case 'invoice.payment_failed':
      const invoice = event.data.object;
      console.log(`Payment failed for invoice: ${invoice.id}`);
      // TODO: Send payment failure notification
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * Success page after checkout
 */
router.get('/success', (req, res) => {
  res.render('stripe-success', {
    title: 'Welcome to the Sanctuary',
    sessionId: req.query.session_id
  });
});

/**
 * Cancel page
 */
router.get('/cancel', (req, res) => {
  res.render('stripe-cancel', {
    title: 'Payment Canceled'
  });
});

export default router;
