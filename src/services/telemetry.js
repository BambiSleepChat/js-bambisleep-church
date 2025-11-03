/**
 * BambiSleep™ Church - Telemetry Service
 * Comprehensive observability using OpenTelemetry and Prometheus
 *
 * Implements CI/CD telemetry best practices:
 * - Distributed tracing across all routes and services
 * - Prometheus metrics (RED pattern: Rate, Errors, Duration)
 * - DORA metrics collection (Deployment Frequency, Lead Time, Change Failure Rate, MTTR)
 * - Security event logging and attack surface monitoring
 * - Custom business metrics and audit logs
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { trace, metrics, context } from '@opentelemetry/api';
import { Registry, Counter, Histogram, Gauge } from 'prom-client';
import winston from 'winston';

// ============================================================================
// Configuration
// ============================================================================

const SERVICE_NAME = 'bambisleep-church';
const SERVICE_VERSION = process.env.npm_package_version || '1.0.0';

// ============================================================================
// Winston Logger (structured logging)
// ============================================================================

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// ============================================================================
// Prometheus Registry and Metrics
// ============================================================================

export const promRegistry = new Registry();

// HTTP Metrics (RED Pattern: Rate, Errors, Duration)
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [promRegistry],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [promRegistry],
});

export const httpRequestsInFlight = new Gauge({
  name: 'http_requests_in_flight',
  help: 'Current number of HTTP requests being processed',
  registers: [promRegistry],
});

// Authentication Metrics
export const authAttemptsTotal = new Counter({
  name: 'auth_attempts_total',
  help: 'Total authentication attempts',
  labelNames: ['type', 'status'],
  registers: [promRegistry],
});

export const authSessionsActive = new Gauge({
  name: 'auth_sessions_active',
  help: 'Number of active authenticated sessions',
  registers: [promRegistry],
});

// Stripe Payment Metrics
export const stripeWebhooksTotal = new Counter({
  name: 'stripe_webhooks_total',
  help: 'Total Stripe webhook events received',
  labelNames: ['event_type', 'status'],
  registers: [promRegistry],
});

export const stripeSubscriptionsActive = new Gauge({
  name: 'stripe_subscriptions_active',
  help: 'Number of active Stripe subscriptions',
  registers: [promRegistry],
});

export const stripePaymentValue = new Counter({
  name: 'stripe_payment_value_total',
  help: 'Total payment value processed (in cents)',
  labelNames: ['currency'],
  registers: [promRegistry],
});

// WebSocket Metrics
export const websocketConnectionsTotal = new Counter({
  name: 'websocket_connections_total',
  help: 'Total WebSocket connections',
  labelNames: ['status'],
  registers: [promRegistry],
});

export const websocketConnectionsActive = new Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections',
  registers: [promRegistry],
});

export const websocketMessagesTotal = new Counter({
  name: 'websocket_messages_total',
  help: 'Total WebSocket messages',
  labelNames: ['type', 'direction'],
  registers: [promRegistry],
});

// Video Streaming Metrics
export const videoStreamsTotal = new Counter({
  name: 'video_streams_total',
  help: 'Total video stream requests',
  labelNames: ['video_id', 'status'],
  registers: [promRegistry],
});

export const videoStreamDuration = new Histogram({
  name: 'video_stream_duration_seconds',
  help: 'Video stream duration in seconds',
  labelNames: ['video_id'],
  buckets: [10, 30, 60, 120, 300, 600, 1800, 3600],
  registers: [promRegistry],
});

// DORA Metrics (DevOps Research and Assessment)
export const deploymentFrequency = new Counter({
  name: 'deployment_frequency_total',
  help: 'Number of deployments to production',
  labelNames: ['environment', 'status'],
  registers: [promRegistry],
});

export const deploymentLeadTime = new Histogram({
  name: 'deployment_lead_time_seconds',
  help: 'Lead time from commit to deployment',
  labelNames: ['environment'],
  buckets: [60, 300, 600, 1800, 3600, 7200, 14400, 28800, 86400],
  registers: [promRegistry],
});

export const changeFailureRate = new Counter({
  name: 'change_failure_rate_total',
  help: 'Number of failed changes requiring rollback or hotfix',
  labelNames: ['environment', 'failure_type'],
  registers: [promRegistry],
});

export const mttrSeconds = new Histogram({
  name: 'mttr_seconds',
  help: 'Mean Time To Recovery in seconds',
  labelNames: ['incident_type'],
  buckets: [60, 300, 600, 1800, 3600, 7200, 14400, 28800, 86400],
  registers: [promRegistry],
});

// Security Metrics (Attack Surface Monitoring)
export const securityEventsTotal = new Counter({
  name: 'security_events_total',
  help: 'Total security events detected',
  labelNames: ['event_type', 'severity'],
  registers: [promRegistry],
});

export const rateLimitHitsTotal = new Counter({
  name: 'rate_limit_hits_total',
  help: 'Number of rate limit violations',
  labelNames: ['endpoint', 'ip'],
  registers: [promRegistry],
});

export const suspiciousActivityTotal = new Counter({
  name: 'suspicious_activity_total',
  help: 'Suspicious activity indicators',
  labelNames: ['activity_type', 'source'],
  registers: [promRegistry],
});

// Business Metrics
export const contentAccessTotal = new Counter({
  name: 'content_access_total',
  help: 'Total content access attempts',
  labelNames: ['content_type', 'access_level', 'status'],
  registers: [promRegistry],
});

export const userRegistrations = new Counter({
  name: 'user_registrations_total',
  help: 'Total user registrations',
  labelNames: ['source'],
  registers: [promRegistry],
});

// ============================================================================
// OpenTelemetry SDK Setup
// ============================================================================

const prometheusExporter = new PrometheusExporter(
  {
    port: 9464, // Prometheus metrics endpoint
    endpoint: '/metrics',
  },
  () => {
    logger.info(
      `Prometheus metrics available at http://localhost:9464/metrics`
    );
  }
);

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: SERVICE_NAME,
    [SEMRESATTRS_SERVICE_VERSION]: SERVICE_VERSION,
  }),
  metricReader: prometheusExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // Disable filesystem instrumentation (too noisy)
      },
    }),
  ],
});

// Initialize OpenTelemetry
sdk.start();

logger.info('OpenTelemetry SDK initialized', {
  service: SERVICE_NAME,
  version: SERVICE_VERSION,
  metricsPort: 9464,
});

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => logger.info('OpenTelemetry SDK shut down successfully'))
    .catch(error =>
      logger.error('Error shutting down OpenTelemetry SDK', error)
    )
    .finally(() => process.exit(0));
});

// ============================================================================
// Telemetry Helper Functions
// ============================================================================

/**
 * Track HTTP request metrics (call in middleware)
 */
export function trackHttpRequest(req, res, duration) {
  const route = req.route?.path || req.path || 'unknown';
  const method = req.method;
  const statusCode = res.statusCode;

  httpRequestsTotal.inc({ method, route, status_code: statusCode });
  httpRequestDuration.observe(
    { method, route, status_code: statusCode },
    duration / 1000
  );
}

/**
 * Track security event
 */
export function trackSecurityEvent(eventType, severity, metadata = {}) {
  securityEventsTotal.inc({ event_type: eventType, severity });

  logger.warn('Security event detected', {
    eventType,
    severity,
    ...metadata,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track authentication attempt
 */
export function trackAuthAttempt(type, status, userId = null) {
  authAttemptsTotal.inc({ type, status });

  logger.info('Authentication attempt', {
    type,
    status,
    userId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track Stripe webhook
 */
export function trackStripeWebhook(eventType, status, metadata = {}) {
  stripeWebhooksTotal.inc({ event_type: eventType, status });

  logger.info('Stripe webhook processed', {
    eventType,
    status,
    ...metadata,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track deployment (DORA metrics)
 */
export function trackDeployment(environment, status, leadTimeSeconds) {
  deploymentFrequency.inc({ environment, status });

  if (leadTimeSeconds) {
    deploymentLeadTime.observe({ environment }, leadTimeSeconds);
  }

  logger.info('Deployment tracked', {
    environment,
    status,
    leadTimeSeconds,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track incident resolution (MTTR)
 */
export function trackIncidentResolution(incidentType, resolutionTimeSeconds) {
  mttrSeconds.observe({ incident_type: incidentType }, resolutionTimeSeconds);

  logger.info('Incident resolved', {
    incidentType,
    resolutionTimeSeconds,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get tracer for creating spans
 */
export function getTracer() {
  return trace.getTracer(SERVICE_NAME, SERVICE_VERSION);
}

/**
 * Get meter for creating custom metrics
 */
export function getMeter() {
  return metrics.getMeter(SERVICE_NAME, SERVICE_VERSION);
}

// ============================================================================
// Express Middleware
// ============================================================================

/**
 * Telemetry middleware for Express
 */
export function telemetryMiddleware() {
  return (req, res, next) => {
    const start = Date.now();

    // Increment in-flight requests
    httpRequestsInFlight.inc();

    // Track request completion
    res.on('finish', () => {
      const duration = Date.now() - start;
      trackHttpRequest(req, res, duration);
      httpRequestsInFlight.dec();
    });

    next();
  };
}

/**
 * Security event middleware (detects suspicious patterns)
 */
export function securityMonitoringMiddleware() {
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /eval\(/i, // Code injection
    /cmd=/i, // Command injection
  ];

  return (req, res, next) => {
    const fullUrl = req.originalUrl || req.url;
    const body = JSON.stringify(req.body);

    // Check for suspicious patterns
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(fullUrl) || pattern.test(body)) {
        trackSecurityEvent('suspicious_request', 'high', {
          ip: req.ip,
          url: fullUrl,
          pattern: pattern.toString(),
        });

        // Increment suspicious activity counter
        suspiciousActivityTotal.inc({
          activity_type: 'injection_attempt',
          source: req.ip,
        });
      }
    }

    next();
  };
}

export default {
  logger,
  promRegistry,
  getTracer,
  getMeter,
  telemetryMiddleware,
  securityMonitoringMiddleware,
  trackHttpRequest,
  trackSecurityEvent,
  trackAuthAttempt,
  trackStripeWebhook,
  trackDeployment,
  trackIncidentResolution,
};
