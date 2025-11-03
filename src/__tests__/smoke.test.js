/**
 * Simple smoke tests to verify basic functionality
 * These tests ensure the core services and middleware can be imported
 * without errors and have the expected exports
 */

import { describe, it, expect } from '@jest/globals';

describe('Core Module Imports', () => {
  describe('Telemetry Service', () => {
    it('should import without errors', async () => {
      const telemetry = await import('../services/telemetry.js');
      expect(telemetry).toBeDefined();
      expect(telemetry.logger).toBeDefined();
      expect(telemetry.trackAuthAttempt).toBeDefined();
      expect(telemetry.trackStripeWebhook).toBeDefined();
      expect(telemetry.trackSecurityEvent).toBeDefined();
    });
  });

  describe('WebSocket Service', () => {
    it('should import without errors', async () => {
      const websocket = await import('../services/websocket.js');
      expect(websocket).toBeDefined();
      expect(websocket.setupWebSocket).toBeDefined();
    });
  });

  describe('Auth Middleware', () => {
    it('should import without errors', async () => {
      const auth = await import('../middleware/auth.js');
      expect(auth).toBeDefined();
      expect(auth.requireAuth).toBeDefined();
      expect(auth.requireSubscription).toBeDefined();
      expect(auth.requireOwnership).toBeDefined();
      expect(auth.generateVideoToken).toBeDefined();
      expect(auth.verifyVideoToken).toBeDefined();
    });
  });

  describe('Route Modules', () => {
    it('should import auth routes', async () => {
      const authRoutes = await import('../routes/auth.js');
      expect(authRoutes.default).toBeDefined();
    });

    it('should import stripe routes', async () => {
      const stripeRoutes = await import('../routes/stripe.js');
      expect(stripeRoutes.default).toBeDefined();
    });

    it('should import markdown routes', async () => {
      const markdownRoutes = await import('../routes/markdown.js');
      expect(markdownRoutes.default).toBeDefined();
    });

    it('should import video routes', async () => {
      const videoRoutes = await import('../routes/video.js');
      expect(videoRoutes.default).toBeDefined();
    });
  });
});

describe('Environment Configuration', () => {
  it('should have NODE_ENV defined', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });

  it('should have required environment variables or defaults', () => {
    // These should either be set or have defaults in the application
    const requiredVars = ['JWT_SECRET', 'SESSION_SECRET', 'STRIPE_SECRET_KEY'];

    requiredVars.forEach(varName => {
      // Just verify the var name exists (may be undefined in test env)
      expect(typeof process.env[varName]).toBe('string' || 'undefined');
    });
  });
});

describe('Utility Functions', () => {
  describe('Video Token Generation', () => {
    it('should generate valid JWT tokens', async () => {
      const { generateVideoToken } = await import('../middleware/auth.js');
      const token = generateVideoToken('video123', 'user456');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });
  });

  describe('Telemetry Tracking', () => {
    it('should track auth attempts without errors', async () => {
      const { trackAuthAttempt } = await import('../services/telemetry.js');

      expect(() => {
        trackAuthAttempt('login', 'success', 'user123');
      }).not.toThrow();
    });

    it('should track security events without errors', async () => {
      const { trackSecurityEvent } = await import('../services/telemetry.js');

      expect(() => {
        trackSecurityEvent('test_event', 'low', { test: true });
      }).not.toThrow();
    });

    it('should track Stripe webhooks without errors', async () => {
      const { trackStripeWebhook } = await import('../services/telemetry.js');

      expect(() => {
        trackStripeWebhook('payment_intent.succeeded', 'success');
      }).not.toThrow();
    });
  });
});
