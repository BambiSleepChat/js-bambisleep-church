import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Temporary in-memory user store (replace with database)
const users = new Map();

/**
 * Register new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user exists
    if (users.has(email)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'bambisleep-church',
        registered_at: new Date().toISOString()
      }
    });

    // Create user
    const user = {
      id: customer.id,
      email,
      name,
      password: hashedPassword,
      stripeCustomerId: customer.id,
      createdAt: new Date().toISOString()
    };

    users.set(email, user);

    // Create session
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      stripeCustomerId: user.stripeCustomerId
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      stripeCustomerId: user.stripeCustomerId
    };

    // Generate JWT token for API access
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        stripeCustomerId: user.stripeCustomerId
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * Logout user
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

/**
 * Get current user
 */
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({
    user: req.session.user
  });
});

export default router;
