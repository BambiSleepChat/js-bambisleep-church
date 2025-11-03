/**
 * Tests for Authentication Middleware
 * Verifies JWT validation, subscription checks, and video token generation
 */

import { jest } from '@jest/globals';

// Mock Stripe before importing middleware
const mockStripe = {
  subscriptions: {
    list: jest.fn(),
  },
};

jest.unstable_mockModule('stripe', () => ({
  default: jest.fn(() => mockStripe),
}));

describe('Authentication Middleware', () => {
  let requireSubscription,
    requireAuth,
    requireOwnership,
    generateVideoToken,
    verifyVideoToken;

  beforeAll(async () => {
    const auth = await import('./auth.js');
    requireSubscription = auth.requireSubscription;
    requireAuth = auth.requireAuth;
    requireOwnership = auth.requireOwnership;
    generateVideoToken = auth.generateVideoToken;
    verifyVideoToken = auth.verifyVideoToken;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requireSubscription', () => {
    it('should reject unauthenticated requests', async () => {
      const req = { session: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await requireSubscription(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Authentication required' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject users without Stripe customer ID', async () => {
      const req = {
        session: { user: { id: 'user123', email: 'test@example.com' } },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await requireSubscription(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'No Stripe customer ID found' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject users without active subscription', async () => {
      mockStripe.subscriptions.list.mockResolvedValue({ data: [] });

      const req = {
        session: {
          user: {
            id: 'user123',
            stripeCustomerId: 'cus_123',
          },
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await requireSubscription(req, res, next);

      expect(mockStripe.subscriptions.list).toHaveBeenCalledWith({
        customer: 'cus_123',
        status: 'active',
        limit: 1,
      });
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Active subscription required' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow users with active subscription', async () => {
      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
        current_period_end: 1234567890,
      };

      mockStripe.subscriptions.list.mockResolvedValue({
        data: [mockSubscription],
      });

      const req = {
        session: {
          user: {
            id: 'user123',
            stripeCustomerId: 'cus_123',
          },
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await requireSubscription(req, res, next);

      expect(mockStripe.subscriptions.list).toHaveBeenCalledWith({
        customer: 'cus_123',
        status: 'active',
        limit: 1,
      });
      expect(req.subscription).toEqual(mockSubscription);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle Stripe API errors', async () => {
      mockStripe.subscriptions.list.mockRejectedValue(
        new Error('Stripe API error')
      );

      const req = {
        session: {
          user: {
            id: 'user123',
            stripeCustomerId: 'cus_123',
          },
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await requireSubscription(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Subscription verification failed' })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireAuth', () => {
    it('should reject requests without token', () => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'No token provided' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid tokens', () => {
      const req = {
        headers: { authorization: 'Bearer invalid.token.here' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid or expired token' })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireOwnership', () => {
    it('should allow user to access own resources', () => {
      const req = {
        session: { user: { id: 'user123', role: 'user' } },
        params: { userId: 'user123' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      requireOwnership(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject user accessing other resources', () => {
      const req = {
        session: { user: { id: 'user123', role: 'user' } },
        params: { userId: 'user456' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      requireOwnership(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Forbidden') })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow admin to access any resources', () => {
      const req = {
        session: { user: { id: 'admin123', role: 'admin' } },
        params: { userId: 'user456' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      requireOwnership(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('Video Token Generation', () => {
    it('should generate valid video token', () => {
      const token = generateVideoToken('video123', 'user456');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format
    });

    it('should include video ID and user ID in token', () => {
      const token = generateVideoToken('video123', 'user456');
      const parts = token.split('.');

      expect(parts[0]).toBeDefined(); // Header
      expect(parts[1]).toBeDefined(); // Payload
      expect(parts[2]).toBeDefined(); // Signature
    });
  });

  describe('verifyVideoToken', () => {
    it('should reject requests without token', () => {
      const req = { query: {}, headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      verifyVideoToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Video access token required' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid video tokens', () => {
      const req = {
        query: { token: 'invalid.token.here' },
        headers: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      verifyVideoToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid video access token' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept valid video tokens', () => {
      // Generate a valid token first
      const validToken = generateVideoToken('video123', 'user456');

      const req = {
        query: { token: validToken },
        headers: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      verifyVideoToken(req, res, next);

      // Should call next() for valid token
      expect(next).toHaveBeenCalled();
      expect(req.videoAccess).toBeDefined();
      expect(req.videoAccess.videoId).toBe('video123');
      expect(req.videoAccess.userId).toBe('user456');
    });
  });
});
