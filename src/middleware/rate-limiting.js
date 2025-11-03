/// 🛡️ OWASP A04: Insecure Design - Rate Limiting Middleware
/// Law: Rate limiting prevents brute force and denial-of-service attacks
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { logger } from '../services/logger.js';

/**
 * Create Redis client for distributed rate limiting
 * Falls back to memory store in development/test
 */
const createRedisClient = () => {
  if (process.env.NODE_ENV === 'test') {
    return null; // Use memory store in tests
  }

  try {
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis connection retry attempt ${times}, delay ${delay}ms`);
        return delay;
      },
    });

    redis.on('error', (err) => {
      logger.error('Redis rate limiter error:', err);
    });

    redis.on('connect', () => {
      logger.info('Redis rate limiter connected');
    });

    return redis;
  } catch (error) {
    logger.error('Failed to create Redis client, using memory store:', error);
    return null;
  }
};

const redis = createRedisClient();

/**
 * Create rate limiter configuration
 * @param {Object} options - Rate limit options
 * @returns {Function} Express middleware
 */
function createRateLimiter(options) {
  const config = {
    windowMs: options.windowMs,
    max: options.max,
    message: { error: options.message },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skip: (req) => process.env.NODE_ENV === 'test', // Skip in tests
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        limit: options.max,
        window: options.windowMs,
      });
      res.status(429).json({
        error: options.message,
        retryAfter: Math.ceil(options.windowMs / 1000),
      });
    },
  };

  // Add Redis store if available
  if (redis) {
    config.store = new RedisStore({
      client: redis,
      prefix: options.prefix || 'rl:',
    });
  }

  return rateLimit(config);
}

/// 🛡️ Strict rate limit for authentication endpoints (OWASP A07)
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  prefix: 'rl:auth:',
});

/// 🛡️ General API rate limiter (60 requests per minute)
export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many requests. Please slow down.',
  prefix: 'rl:api:',
});

/// 🛡️ Strict limiter for expensive MCP operations
export const expensiveLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Operation limit reached. Please try again in an hour.',
  prefix: 'rl:expensive:',
});

/// 🛡️ Moderate limiter for donation endpoints
export const donationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 donations per hour
  message: 'Donation limit reached. Please try again in an hour.',
  prefix: 'rl:donation:',
});

/**
 * Graceful shutdown of Redis connection
 */
export async function closeRateLimiter() {
  if (redis) {
    logger.info('Closing Redis rate limiter connection');
    await redis.quit();
  }
}
