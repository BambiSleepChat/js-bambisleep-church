# Telemetry Quick Reference Card

> **Fast reference for developers** integrating telemetry into BambiSleep™ Church routes

---

## 🚀 Import Statement

```javascript
import { 
  logger,                          // Winston structured logger
  trackAuthAttempt,                // Auth event tracking
  trackStripeWebhook,              // Stripe event tracking
  trackSecurityEvent,              // Security event tracking
  trackDeployment,                 // DORA deployment frequency
  trackIncidentResolution,         // DORA MTTR
  
  // Prometheus metrics
  authSessionsActive,              // Gauge
  userRegistrations,               // Counter
  stripeSubscriptionsActive,       // Gauge
  stripePaymentValue,              // Counter
  contentAccessTotal,              // Counter
  videoStreamsTotal,               // Counter
  videoStreamDuration,             // Histogram
  websocketConnectionsActive,      // Gauge
  websocketConnectionsTotal,       // Counter
  websocketMessagesTotal           // Counter
} from '../services/telemetry.js';
```

---

## 📊 Common Patterns

### 1. Authentication Tracking

```javascript
// Registration attempt
try {
  // ... validation logic ...
  if (!isValidEmail(email)) {
    trackAuthAttempt('registration', 'failed_validation', null);
    return res.status(400).json({ error: 'Invalid email' });
  }
  
  if (existingUser) {
    trackAuthAttempt('registration', 'failed_exists', null);
    trackSecurityEvent('duplicate_registration_attempt', 'medium', {
      email: email,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    return res.status(409).json({ error: 'User already exists' });
  }
  
  // ... create user ...
  
  trackAuthAttempt('registration', 'success', user.id);
  userRegistrations.inc({ source: 'web' });
  authSessionsActive.inc();
  
  logger.info('User registered successfully', {
    userId: user.id,
    email: user.email,
    ip: req.ip
  });
  
} catch (error) {
  trackAuthAttempt('registration', 'failed_error', null);
  logger.error('Registration failed', { error: error.message, stack: error.stack });
  return res.status(500).json({ error: 'Internal server error' });
}
```

### 2. Stripe Webhook Tracking

```javascript
// In webhook handler switch statement
switch (event.type) {
  case 'payment_intent.succeeded':
    trackStripeWebhook('payment_intent.succeeded', 'success');
    stripePaymentValue.inc({ currency: paymentIntent.currency }, paymentIntent.amount / 100);
    logger.info('Payment succeeded', { 
      paymentIntentId: paymentIntent.id, 
      amount: paymentIntent.amount 
    });
    break;
    
  case 'customer.subscription.created':
    trackStripeWebhook('customer.subscription.created', 'success');
    stripeSubscriptionsActive.inc();
    logger.info('Subscription created', { subscriptionId: subscription.id });
    break;
    
  case 'customer.subscription.deleted':
    trackStripeWebhook('customer.subscription.deleted', 'success');
    stripeSubscriptionsActive.dec();
    logger.info('Subscription deleted', { subscriptionId: subscription.id });
    break;
    
  case 'invoice.payment_failed':
    trackStripeWebhook('invoice.payment_failed', 'failed');
    trackSecurityEvent('payment_failure', 'high', {
      customerId: invoice.customer,
      invoiceId: invoice.id,
      amount: invoice.amount_due
    });
    logger.error('Invoice payment failed', { invoiceId: invoice.id });
    break;
    
  default:
    trackStripeWebhook(event.type, 'unhandled');
    logger.warn('Unhandled webhook event', { eventType: event.type });
}
```

### 3. Content Access Tracking

```javascript
// Public markdown
app.get('/markdown/public/:filename', (req, res) => {
  contentAccessTotal.inc({ content_type: 'markdown', access_level: 'public' });
  logger.info('Public content accessed', { filename: req.params.filename, ip: req.ip });
  // ... serve file ...
});

// Premium markdown (subscription-gated)
app.get('/markdown/private/:filename', requireSubscription, (req, res) => {
  contentAccessTotal.inc({ content_type: 'markdown', access_level: 'premium' });
  logger.info('Premium content accessed', { 
    filename: req.params.filename, 
    userId: req.user.id,
    ip: req.ip 
  });
  // ... serve file ...
});
```

### 4. Video Streaming Tracking

```javascript
// Video access token generation
app.get('/video/access/:videoId', requireAuth, requireSubscription, (req, res) => {
  const token = generateVideoToken(req.params.videoId, req.user.id);
  
  contentAccessTotal.inc({ content_type: 'video', access_level: 'premium' });
  logger.info('Video access token generated', {
    videoId: req.params.videoId,
    userId: req.user.id,
    ip: req.ip
  });
  
  res.json({ token });
});

// Video streaming
app.get('/video/stream/:videoId', verifyVideoToken, (req, res) => {
  const startTime = Date.now();
  
  videoStreamsTotal.inc({ video_id: req.params.videoId, quality: 'hd' });
  logger.info('Video stream started', { videoId: req.params.videoId });
  
  // ... stream video ...
  
  // On stream end (req.on('close') or res.on('finish'))
  req.on('close', () => {
    const duration = (Date.now() - startTime) / 1000;
    videoStreamDuration.observe(duration);
    logger.info('Video stream ended', { 
      videoId: req.params.videoId, 
      duration: duration 
    });
  });
});
```

### 5. WebSocket Connection Tracking

```javascript
// Connection established
wss.on('connection', (ws, req) => {
  const clientId = uuidv4();
  
  websocketConnectionsTotal.inc();
  websocketConnectionsActive.inc();
  
  clients.set(clientId, {
    ws,
    authenticated: false,
    userId: null,
    connectedAt: new Date()
  });
  
  logger.info('WebSocket connection established', { clientId, ip: req.socket.remoteAddress });
  
  // Connection closed
  ws.on('close', () => {
    websocketConnectionsActive.dec();
    clients.delete(clientId);
    logger.info('WebSocket connection closed', { clientId });
  });
  
  // Message received
  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    websocketMessagesTotal.inc({ direction: 'inbound', message_type: message.type });
    
    // ... handle message ...
    
    // Send response
    ws.send(JSON.stringify(response));
    websocketMessagesTotal.inc({ direction: 'outbound', message_type: response.type });
  });
});

// WebSocket authentication
function handleAuthMessage(clientId, message) {
  try {
    const decoded = jwt.verify(message.token, process.env.JWT_SECRET);
    const client = clients.get(clientId);
    
    client.authenticated = true;
    client.userId = decoded.userId;
    
    trackAuthAttempt('websocket', 'success', decoded.userId);
    logger.info('WebSocket authenticated', { clientId, userId: decoded.userId });
    
  } catch (error) {
    trackAuthAttempt('websocket', 'failed', null);
    logger.error('WebSocket authentication failed', { 
      clientId, 
      error: error.message 
    });
  }
}
```

### 6. Security Event Tracking

```javascript
// Directory traversal detection
if (filename.includes('..') || filename.includes('/')) {
  trackSecurityEvent('directory_traversal_attempt', 'critical', {
    filename: filename,
    ip: req.ip,
    userId: req.user?.id || 'anonymous'
  });
  logger.error('Directory traversal blocked', { filename, ip: req.ip });
  return res.status(403).json({ error: 'Access denied' });
}

// Rate limit exceeded
app.use((req, res, next) => {
  if (req.rateLimit?.remaining === 0) {
    trackSecurityEvent('rate_limit_exceeded', 'medium', {
      ip: req.ip,
      route: req.path,
      limit: req.rateLimit.limit
    });
    logger.warn('Rate limit exceeded', { ip: req.ip, route: req.path });
  }
  next();
});

// Suspicious JWT token
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
} catch (error) {
  trackSecurityEvent('invalid_jwt_attempt', 'high', {
    error: error.message,
    ip: req.ip,
    token: token.substring(0, 20) + '...'  // Don't log full token
  });
  logger.error('JWT verification failed', { error: error.message, ip: req.ip });
}
```

### 7. DORA Metrics Tracking

```javascript
// Track deployment (call from deployment script or GitHub Actions)
app.post('/api/telemetry/deployment', requireAuth, (req, res) => {
  trackDeployment();
  logger.info('Deployment tracked', { 
    version: req.body.version, 
    triggeredBy: req.user.id 
  });
  res.json({ success: true });
});

// Track incident resolution
app.post('/api/telemetry/incident', requireAuth, (req, res) => {
  const { startTime, endTime } = req.body;
  const duration = (endTime - startTime) / 1000; // Convert to seconds
  
  trackIncidentResolution(duration);
  logger.info('Incident resolved', { 
    duration: duration, 
    resolvedBy: req.user.id 
  });
  res.json({ success: true });
});
```

---

## 🔍 Logging Levels

```javascript
// ERROR: System failures, exceptions
logger.error('Payment processing failed', { 
  error: error.message, 
  stack: error.stack,
  paymentIntentId: paymentIntent.id 
});

// WARN: Unusual but handled events
logger.warn('Unhandled webhook event', { 
  eventType: event.type,
  eventId: event.id 
});

// INFO: Normal operations, business events
logger.info('User logged in', { 
  userId: user.id, 
  email: user.email,
  ip: req.ip 
});

// DEBUG: Detailed diagnostic information (not logged in production)
logger.debug('Database query executed', { 
  query: query,
  duration: queryDuration 
});
```

---

## 📈 Prometheus Query Examples

### HTTP Performance
```promql
# Request rate (per second)
rate(http_requests_total[5m])

# Error rate (percentage)
sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100

# 95th percentile latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Authentication
```promql
# Failed login rate
rate(auth_attempts_total{type="login", outcome=~"failed.*"}[5m])

# Active sessions
auth_sessions_active
```

### Stripe Payments
```promql
# Revenue per hour (USD)
sum(increase(stripe_payment_value_total{currency="usd"}[1h]))

# Webhook failure rate
sum(rate(stripe_webhooks_total{status="failed"}[5m])) / sum(rate(stripe_webhooks_total[5m])) * 100
```

### DORA Metrics
```promql
# Deployments per day
increase(deployment_frequency[1d])

# Average lead time (minutes)
rate(lead_time_seconds_sum[1d]) / rate(lead_time_seconds_count[1d]) / 60

# MTTR (hours)
rate(mttr_seconds_sum[7d]) / rate(mttr_seconds_count[7d]) / 3600
```

---

## 🎯 Integration Checklist

When adding telemetry to a new route:

- [ ] Import required telemetry functions from `../services/telemetry.js`
- [ ] Track operation start/end times (for Histograms)
- [ ] Increment/decrement Gauges appropriately (active connections, sessions)
- [ ] Increment Counters for discrete events (requests, errors, registrations)
- [ ] Use `logger.info()` for successful operations
- [ ] Use `logger.error()` for failures (with error object)
- [ ] Use `logger.warn()` for unusual but handled events
- [ ] Track security events for suspicious behavior
- [ ] Include relevant metadata (userId, ip, resource IDs)
- [ ] Test metrics appear on `/metrics` endpoint
- [ ] Verify logs written to `logs/` directory

---

## 🚨 Common Pitfalls

1. **Don't log sensitive data** (passwords, full tokens, credit cards)
2. **Label cardinality** - Avoid high-cardinality labels (user IDs, timestamps)
3. **Histogram buckets** - Use appropriate buckets for your use case
4. **Gauge usage** - Remember to decrement when done (connections, active sessions)
5. **Counter reset** - Counters only increase, never set/decrease
6. **Structured logging** - Always pass metadata as object, not string interpolation
7. **Error objects** - Log `error.message` and `error.stack`, not just `error.toString()`

---

## 📚 Further Reading

- **TELEMETRY.md** - Complete observability architecture (400+ lines)
- **SECURITY.md** - Attack surface management guide (350+ lines)
- **src/services/telemetry.js** - Full implementation reference (450 lines)

---

**Quick Start**: Copy pattern from `src/routes/auth.js` (already integrated) ✅
