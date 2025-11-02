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
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      frameSrc: ["https://js.stripe.com"],
      connectSrc: ["'self'", "wss:", "ws:"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "blob:"]
    }
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://bambisleep.church' 
    : 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Session management
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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
    user: req.session.user || null
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Lost in the Sanctuary',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).render('error', {
    title: 'Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message,
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Setup WebSocket
setupWebSocket(wss);

// Start server
server.listen(PORT, HOST, () => {
  console.log(`
  👑 BambiSleep Church Server
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Environment: ${process.env.NODE_ENV || 'development'}
  HTTP Server: http://${HOST}:${PORT}
  WebSocket: ws://${HOST}:${PORT}
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
