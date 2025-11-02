import Stripe from 'stripe';
import jwt from 'jsonwebtoken';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Middleware to verify user has active Stripe subscription
 */
export async function requireSubscription(req, res, next) {
  try {
    // Check if user is authenticated
    if (!req.session.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        redirectTo: '/auth/login'
      });
    }

    const { stripeCustomerId } = req.session.user;

    if (!stripeCustomerId) {
      return res.status(403).json({
        error: 'No Stripe customer ID found',
        redirectTo: '/stripe/subscribe'
      });
    }

    // Check for active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      return res.status(403).json({
        error: 'Active subscription required',
        hasAccess: false,
        redirectTo: '/stripe/subscribe'
      });
    }

    // Attach subscription info to request
    req.subscription = subscriptions.data[0];
    next();
  } catch (error) {
    console.error('Subscription verification error:', error);
    res.status(500).json({ error: 'Subscription verification failed' });
  }
}

/**
 * Middleware to verify JWT token for API access
 */
export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware to check if user owns content or has admin role
 */
export function requireOwnership(req, res, next) {
  const userId = req.session.user?.id || req.user?.id;
  const resourceOwnerId = req.params.userId || req.body.userId;

  if (userId !== resourceOwnerId && req.session.user?.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Forbidden: You do not have permission to access this resource' 
    });
  }

  next();
}

/**
 * Generate signed JWT for video access
 */
export function generateVideoToken(videoId, userId) {
  const expires = Math.floor(Date.now() / 1000) + 3600; // 1 hour
  
  return jwt.sign(
    { videoId, userId, expires },
    process.env.VIDEO_SIGNING_KEY || process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Verify video access token
 */
export function verifyVideoToken(req, res, next) {
  const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Video access token required' });
  }

  try {
    const decoded = jwt.verify(
      token, 
      process.env.VIDEO_SIGNING_KEY || process.env.JWT_SECRET
    );
    
    if (decoded.expires < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ error: 'Video access token expired' });
    }

    req.videoAccess = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid video access token' });
  }
}
