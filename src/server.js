import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import session from 'express-session';
import rateLimit from 'express-rate-limit';

// Import telemetry service (must be first for OpenTelemetry auto-instrumentation)
import {
  logger,
  telemetryMiddleware,
  securityMonitoringMiddleware,
  promRegistry,
} from './services/telemetry.js';

// Import MCP Server Manager
import { mcpManager } from './services/mcp-manager.js';

// Import routes
import markdownRouter from './routes/markdown.js';
import stripeRouter from './routes/stripe.js';
import videoRouter from './routes/video.js';
import authRouter from './routes/auth.js';

// Import WebSocket handler
import { setupWebSocket } from './services/websocket.js';

// ES Module path handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        frameSrc: ['https://js.stripe.com'],
        connectSrc: ["'self'", 'wss:', 'ws:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        mediaSrc: ["'self'", 'blob:'],
      },
    },
  })
);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://bambisleep.church'
        : 'http://localhost:3000',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

/// 🛡️ OWASP Security Middleware (MUST be early in middleware chain)
import {
  securityHeaders,
  enforceHTTPS,
} from './middleware/security-headers.js';
import { apiLimiter } from './middleware/rate-limiting.js';

// HTTPS enforcement (production only)
app.use(enforceHTTPS);

// Security headers (helmet)
app.use(securityHeaders);

// General API rate limiting
app.use('/api/', apiLimiter);

// Telemetry and monitoring middleware
app.use(telemetryMiddleware());
app.use(securityMonitoringMiddleware());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/// 🛡️ OWASP A02: Cryptographic Failures - Strong SESSION_SECRET enforcement
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  logger.error('❌ SESSION_SECRET not set or too weak (minimum 32 characters)');
  logger.error(
    "Generate a strong secret with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
  );

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SESSION_SECRET must be set in production with minimum 32 characters'
    );
  }

  logger.warn('⚠️ Using temporary session secret - NOT FOR PRODUCTION');
}

// Session management with secure configuration
app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      require('crypto').randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true, // Prevent XSS cookie theft
      sameSite: 'strict', // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Static files
app.use(express.static(join(__dirname, '../public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', join(__dirname, '../views'));

// Routes
app.use('/auth', authRouter);
app.use('/markdown', markdownRouter);
app.use('/stripe', stripeRouter);
app.use('/video', videoRouter);

// Home route
app.get('/', (req, res) => {
  res.render('index', {
    title: 'BambiSleep Church - Aristocratic Sanctuary',
    user: req.session.user || null,
  });
});

// Health check (enhanced with telemetry)
app.get('/health', async (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    metrics: {
      available: true,
      endpoint: 'http://localhost:9464/metrics',
    },
  };

  logger.info('Health check requested', { ip: req.ip });
  res.json(healthData);
});

// Prometheus metrics endpoint (proxied from port 9464)
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promRegistry.contentType);
    const metrics = await promRegistry.metrics();
    res.end(metrics);
  } catch (error) {
    logger.error('Error fetching metrics', { error: error.message });
    res.status(500).end(error.message);
  }
});

// DORA metrics endpoint (human-readable dashboard)
app.get('/dora', (req, res) => {
  res.json({
    message: 'DORA Metrics Dashboard',
    info: 'DevOps Research and Assessment metrics for continuous improvement',
    metrics: {
      deployment_frequency:
        'Track via /metrics endpoint: deployment_frequency_total',
      lead_time_for_changes:
        'Track via /metrics endpoint: deployment_lead_time_seconds',
      change_failure_rate:
        'Track via /metrics endpoint: change_failure_rate_total',
      mean_time_to_recovery: 'Track via /metrics endpoint: mttr_seconds',
    },
    prometheus_url: 'http://localhost:9464/metrics',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Lost in the Sanctuary',
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Application error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  res.status(err.status || 500).render('error', {
    title: 'Error',
    message:
      process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
    error: process.env.NODE_ENV === 'production' ? {} : err,
  });
});

// Setup WebSocket
setupWebSocket(wss);

// Initialize custom MCP servers
mcpManager.initialize().catch(error => {
  logger.error('Failed to initialize MCP servers:', error);
});

// MCP Server status endpoint
app.get('/api/mcp/status', (req, res) => {
  const status = mcpManager.getServerStatus();
  res.json({
    servers: status,
    total: status.length,
    running: status.filter(s => s.status === 'running').length,
  });
});

// Start server
server.listen(PORT, HOST, () => {
  logger.info('BambiSleep Church Server Started', {
    environment: process.env.NODE_ENV || 'development',
    http: `http://${HOST}:${PORT}`,
    websocket: `ws://${HOST}:${PORT}`,
    metrics: 'http://localhost:9464/metrics',
    health: `http://${HOST}:${PORT}/health`,
    dora: `http://${HOST}:${PORT}/dora`,
    mcp_servers: mcpManager.getServerStatus().length,
  });

  console.log(`
  👑 BambiSleep Church Server
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Environment: ${process.env.NODE_ENV || 'development'}
  HTTP Server: http://${HOST}:${PORT}
  WebSocket: ws://${HOST}:${PORT}
  Metrics: http://localhost:9464/metrics
  Health: http://${HOST}:${PORT}/health
  DORA: http://${HOST}:${PORT}/dora
  MCP Servers: ${mcpManager.getServerStatus().length}
  MCP Status: http://${HOST}:${PORT}/api/mcp/status
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, initiating graceful shutdown');

  /// 🛡️ Close rate limiter Redis connection
  const { closeRateLimiter } = await import('./middleware/rate-limiting.js');
  await closeRateLimiter();

  await mcpManager.shutdown();
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, initiating graceful shutdown');

  /// 🛡️ Close rate limiter Redis connection
  const { closeRateLimiter } = await import('./middleware/rate-limiting.js');
  await closeRateLimiter();

  await mcpManager.shutdown();
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
