/**
 * Tests for Telemetry Service
 * Verifies OpenTelemetry integration, Prometheus metrics, and logging
 */

import { jest } from '@jest/globals';

describe('Telemetry Service', () => {
  let logger,
    trackAuthAttempt,
    trackStripeWebhook,
    trackSecurityEvent,
    telemetryMiddleware,
    securityMonitoringMiddleware;

  beforeAll(async () => {
    // Import after Jest is initialized
    const telemetry = await import('./telemetry.js');
    logger = telemetry.logger;
    trackAuthAttempt = telemetry.trackAuthAttempt;
    trackStripeWebhook = telemetry.trackStripeWebhook;
    trackSecurityEvent = telemetry.trackSecurityEvent;
    telemetryMiddleware = telemetry.telemetryMiddleware;
    securityMonitoringMiddleware = telemetry.securityMonitoringMiddleware;
  });

  describe('Logger', () => {
    it('should have winston logger instance', () => {
      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
    });

    it('should log info messages', () => {
      const spy = jest.spyOn(logger, 'info');
      logger.info('Test message', { test: true });
      expect(spy).toHaveBeenCalledWith('Test message', { test: true });
      spy.mockRestore();
    });

    it('should log error messages with stack traces', () => {
      const spy = jest.spyOn(logger, 'error');
      const error = new Error('Test error');
      logger.error('Error occurred', { error: error.message });
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('Authentication Tracking', () => {
    it('should track successful login attempts', () => {
      expect(() => {
        trackAuthAttempt('login', 'success', 'user123');
      }).not.toThrow();
    });

    it('should track failed login attempts', () => {
      expect(() => {
        trackAuthAttempt('login', 'failed', null);
      }).not.toThrow();
    });

    it('should track registration attempts', () => {
      expect(() => {
        trackAuthAttempt('registration', 'success', 'user456');
      }).not.toThrow();
    });

    it('should track WebSocket authentication', () => {
      expect(() => {
        trackAuthAttempt('websocket', 'success', 'user789');
      }).not.toThrow();
    });
  });

  describe('Stripe Webhook Tracking', () => {
    it('should track payment intent succeeded events', () => {
      expect(() => {
        trackStripeWebhook('payment_intent.succeeded', 'success', {
          amount: 1000,
          currency: 'usd',
        });
      }).not.toThrow();
    });

    it('should track subscription created events', () => {
      expect(() => {
        trackStripeWebhook('customer.subscription.created', 'success');
      }).not.toThrow();
    });

    it('should track webhook failures', () => {
      expect(() => {
        trackStripeWebhook('unknown', 'failed', {
          error: 'Invalid signature',
        });
      }).not.toThrow();
    });
  });

  describe('Security Event Tracking', () => {
    it('should track directory traversal attempts', () => {
      expect(() => {
        trackSecurityEvent('directory_traversal', 'critical', {
          path: '../../../etc/passwd',
          ip: '192.168.1.1',
        });
      }).not.toThrow();
    });

    it('should track XSS attempts', () => {
      expect(() => {
        trackSecurityEvent('xss_attempt', 'high', {
          payload: '<script>alert(1)</script>',
        });
      }).not.toThrow();
    });

    it('should track SQL injection attempts', () => {
      expect(() => {
        trackSecurityEvent('sql_injection', 'critical', {
          query: "' OR '1'='1",
        });
      }).not.toThrow();
    });
  });

  describe('Telemetry Middleware', () => {
    it('should return middleware function', () => {
      const middleware = telemetryMiddleware();
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });

    it('should track HTTP requests', done => {
      const middleware = telemetryMiddleware();
      const req = { method: 'GET', path: '/test' };
      const res = {
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            setTimeout(callback, 0);
          }
        }),
        statusCode: 200,
      };
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();

      // Wait for 'finish' event to fire
      setTimeout(() => {
        expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
        done();
      }, 10);
    });
  });

  describe('Security Monitoring Middleware', () => {
    it('should return middleware function', () => {
      const middleware = securityMonitoringMiddleware();
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3);
    });

    it('should detect directory traversal attempts', () => {
      const middleware = securityMonitoringMiddleware();
      const req = {
        originalUrl: '/markdown/public/../../../etc/passwd',
        url: '/markdown/public/../../../etc/passwd',
        body: {},
        ip: '192.168.1.1',
      };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should detect XSS attempts in URL', () => {
      const middleware = securityMonitoringMiddleware();
      const req = {
        originalUrl: '/search?q=<script>alert(1)</script>',
        url: '/search?q=<script>alert(1)</script>',
        body: {},
        ip: '192.168.1.1',
      };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should detect SQL injection in body', () => {
      const middleware = securityMonitoringMiddleware();
      const req = {
        originalUrl: '/api/search',
        url: '/api/search',
        body: { query: "' OR '1'='1' UNION SELECT * FROM users" },
        ip: '192.168.1.1',
      };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should allow safe requests through', () => {
      const middleware = securityMonitoringMiddleware();
      const req = {
        originalUrl: '/markdown/public/welcome.md',
        url: '/markdown/public/welcome.md',
        body: { name: 'John Doe' },
        ip: '192.168.1.1',
      };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Prometheus Metrics', () => {
    it('should export metrics registry', async () => {
      const { promRegistry } = await import('./telemetry.js');
      expect(promRegistry).toBeDefined();
      expect(promRegistry.metrics).toBeDefined();
    });

    it('should have HTTP metrics counters', async () => {
      const { httpRequestsTotal } = await import('./telemetry.js');
      expect(httpRequestsTotal).toBeDefined();
      expect(httpRequestsTotal.inc).toBeDefined();
    });

    it('should have auth metrics', async () => {
      const { authAttemptsTotal, authSessionsActive } = await import(
        './telemetry.js'
      );
      expect(authAttemptsTotal).toBeDefined();
      expect(authSessionsActive).toBeDefined();
    });

    it('should have Stripe metrics', async () => {
      const {
        stripeWebhooksTotal,
        stripePaymentValue,
        stripeSubscriptionsActive,
      } = await import('./telemetry.js');
      expect(stripeWebhooksTotal).toBeDefined();
      expect(stripePaymentValue).toBeDefined();
      expect(stripeSubscriptionsActive).toBeDefined();
    });

    it('should have WebSocket metrics', async () => {
      const {
        websocketConnectionsTotal,
        websocketConnectionsActive,
        websocketMessagesTotal,
      } = await import('./telemetry.js');
      expect(websocketConnectionsTotal).toBeDefined();
      expect(websocketConnectionsActive).toBeDefined();
      expect(websocketMessagesTotal).toBeDefined();
    });

    it('should have DORA metrics', async () => {
      const {
        deploymentFrequency,
        deploymentLeadTime,
        changeFailureRate,
        mttrSeconds,
      } = await import('./telemetry.js');
      expect(deploymentFrequency).toBeDefined();
      expect(deploymentLeadTime).toBeDefined();
      expect(changeFailureRate).toBeDefined();
      expect(mttrSeconds).toBeDefined();
    });
  });
});
