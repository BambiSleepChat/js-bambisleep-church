# BambiSleep™ Church - Telemetry & Observability Architecture

**Version:** 1.0.0  
**Last Updated:** 2025-11-03  
**Status:** Production-Ready

---

## 📊 Overview

This document describes the comprehensive telemetry, observability, and monitoring architecture implemented for the BambiSleep™ Church platform, following industry-standard CI/CD telemetry best practices and OWASP attack surface management guidelines.

### Key Capabilities

- **OpenTelemetry Integration**: Distributed tracing across all HTTP, WebSocket, and Stripe webhook operations
- **Prometheus Metrics**: Production-grade metrics collection with RED pattern (Rate, Errors, Duration)
- **DORA Metrics**: DevOps Research and Assessment metrics for continuous improvement
- **Security Monitoring**: Attack surface monitoring with suspicious activity detection
- **Structured Logging**: Winston-based JSON logging with correlation IDs
- **Business Metrics**: User activity, subscription tracking, content access analytics

---

## 🏗️ Architecture Components

### 1. OpenTelemetry SDK (`src/services/telemetry.js`)

**Purpose**: Vendor-neutral observability instrumentation

**Features**:
- Auto-instrumentation for Express.js, HTTP, and WebSocket
- Distributed tracing with span context propagation
- Custom metric exporters (Prometheus format)
- Resource attributes for service identification

**Endpoints**:
- Prometheus metrics: `http://localhost:9464/metrics`
- Main app proxy: `http://localhost:3000/metrics`

### 2. Prometheus Metrics Collection

**Metric Types**:
- **Counters**: Monotonically increasing values (requests, errors, events)
- **Gauges**: Point-in-time values (active connections, memory usage)
- **Histograms**: Distribution of values (latency, duration)

**Metric Categories**:

#### HTTP Metrics (RED Pattern)
```prometheus
http_requests_total{method,route,status_code}
http_request_duration_seconds{method,route,status_code}
http_requests_in_flight
```

#### Authentication Metrics
```prometheus
auth_attempts_total{type,status}
auth_sessions_active
```

#### Stripe Payment Metrics
```prometheus
stripe_webhooks_total{event_type,status}
stripe_subscriptions_active
stripe_payment_value_total{currency}
```

#### WebSocket Metrics
```prometheus
websocket_connections_total{status}
websocket_connections_active
websocket_messages_total{type,direction}
```

#### Video Streaming Metrics
```prometheus
video_streams_total{video_id,status}
video_stream_duration_seconds{video_id}
```

#### DORA Metrics (DevOps Excellence)
```prometheus
deployment_frequency_total{environment,status}
deployment_lead_time_seconds{environment}
change_failure_rate_total{environment,failure_type}
mttr_seconds{incident_type}
```

#### Security Metrics (Attack Surface Monitoring)
```prometheus
security_events_total{event_type,severity}
rate_limit_hits_total{endpoint,ip}
suspicious_activity_total{activity_type,source}
```

#### Business Metrics
```prometheus
content_access_total{content_type,access_level,status}
user_registrations_total{source}
```

### 3. Winston Structured Logging

**Log Levels**: error, warn, info, http, verbose, debug, silly

**Log Outputs**:
- `logs/error.log` - Error-level logs only
- `logs/combined.log` - All log levels
- Console - Colorized output for development

**Log Format**:
```json
{
  "timestamp": "2025-11-03T10:30:45.123Z",
  "level": "info",
  "message": "User registered successfully",
  "service": "bambisleep-church",
  "version": "1.0.0",
  "environment": "production",
  "userId": "cus_abc123",
  "email": "user@example.com",
  "ip": "192.168.1.100"
}
```

---

## 🔍 Telemetry Integration Points

### HTTP Middleware (`telemetryMiddleware`)

Automatically tracks:
- Request method, route, status code
- Response time (duration)
- In-flight request count
- Error rates

**Usage**:
```javascript
app.use(telemetryMiddleware());
```

### Security Monitoring Middleware (`securityMonitoringMiddleware`)

Detects suspicious patterns:
- Directory traversal attempts (`../`)
- XSS injection (`<script>`)
- SQL injection (`union select`)
- Code injection (`eval(`)
- Command injection (`cmd=`)

**Usage**:
```javascript
app.use(securityMonitoringMiddleware());
```

### Authentication Tracking

**Functions**:
- `trackAuthAttempt(type, status, userId)` - Login/registration/logout events
- Updates `auth_attempts_total` and `auth_sessions_active` metrics
- Logs structured authentication events

**Example**:
```javascript
trackAuthAttempt('login', 'success', user.id);
authSessionsActive.inc();
```

### Stripe Webhook Tracking

**Function**:
- `trackStripeWebhook(eventType, status, metadata)` - Payment events
- Updates `stripe_webhooks_total` and business value metrics
- Logs payment processing events

**Example**:
```javascript
trackStripeWebhook('customer.subscription.created', 'success', {
  customerId: subscription.customer,
  planId: subscription.items.data[0].price.id
});
stripeSubscriptionsActive.inc();
```

### Deployment Tracking (DORA Metrics)

**Function**:
- `trackDeployment(environment, status, leadTimeSeconds)` - CI/CD deployments
- Tracks deployment frequency and lead time
- Enables DORA metric calculation

**Example**:
```javascript
const deployStart = Date.parse(process.env.CI_COMMIT_TIMESTAMP);
const deployEnd = Date.now();
const leadTime = (deployEnd - deployStart) / 1000;

trackDeployment('production', 'success', leadTime);
```

### Incident Resolution Tracking (MTTR)

**Function**:
- `trackIncidentResolution(incidentType, resolutionTimeSeconds)` - Incident response
- Calculates Mean Time To Recovery
- Enables reliability monitoring

**Example**:
```javascript
const incidentStart = Date.parse(incident.createdAt);
const resolutionTime = (Date.now() - incidentStart) / 1000;

trackIncidentResolution('service_outage', resolutionTime);
```

---

## 📈 DORA Metrics Explained

DORA (DevOps Research and Assessment) metrics measure software delivery performance:

### 1. Deployment Frequency
**Definition**: How often code is deployed to production  
**Elite**: Multiple deploys per day  
**High**: Between once per week and once per day  
**Medium**: Between once per month and once per week  
**Low**: Fewer than once per month

**Metric**: `deployment_frequency_total{environment="production",status="success"}`

### 2. Lead Time for Changes
**Definition**: Time from code commit to production deployment  
**Elite**: Less than one hour  
**High**: Between one day and one week  
**Medium**: Between one week and one month  
**Low**: More than one month

**Metric**: `deployment_lead_time_seconds{environment="production"}`

### 3. Change Failure Rate
**Definition**: Percentage of deployments causing failures requiring rollback/hotfix  
**Elite**: 0-15%  
**High**: 16-30%  
**Medium**: 31-45%  
**Low**: 46-60%

**Metric**: `change_failure_rate_total{environment="production",failure_type="*"}`

### 4. Mean Time To Recovery (MTTR)
**Definition**: Time to restore service after incident  
**Elite**: Less than one hour  
**High**: Less than one day  
**Medium**: Between one day and one week  
**Low**: More than one week

**Metric**: `mttr_seconds{incident_type="*"}`

---

## 🛡️ Security Monitoring

### Attack Surface Detection

The security monitoring middleware automatically detects:

1. **Directory Traversal**: `../` patterns in URLs or request bodies
2. **XSS Attempts**: `<script>` tags or JavaScript execution attempts
3. **SQL Injection**: `union select` and other SQL patterns
4. **Code Injection**: `eval(` and similar execution patterns
5. **Command Injection**: `cmd=` and OS command patterns

**Metrics**:
- `security_events_total{event_type="suspicious_request",severity="high"}`
- `suspicious_activity_total{activity_type="injection_attempt",source="<ip>"}`

### Rate Limiting Tracking

Automatically tracks rate limit violations:
- Endpoint being rate-limited
- Source IP address
- Frequency of violations

**Metric**: `rate_limit_hits_total{endpoint="/api/*",ip="<ip>"}`

### Audit Logging

All security events are logged with:
- Event type and severity
- Source IP address
- Request URL and method
- Timestamp and correlation ID

---

## 📊 Grafana Dashboard Setup

### Recommended Panels

#### 1. HTTP Request Rate (RED)
```promql
rate(http_requests_total[5m])
```

#### 2. Error Rate
```promql
rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m])
```

#### 3. P95 Latency
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

#### 4. Active WebSocket Connections
```promql
websocket_connections_active
```

#### 5. Stripe Revenue (Last 24h)
```promql
increase(stripe_payment_value_total{currency="usd"}[24h]) / 100
```

#### 6. DORA - Deployment Frequency (Weekly)
```promql
sum(increase(deployment_frequency_total{environment="production",status="success"}[7d]))
```

#### 7. DORA - Change Failure Rate
```promql
sum(rate(change_failure_rate_total[7d])) / sum(rate(deployment_frequency_total[7d])) * 100
```

#### 8. Security Events (Last Hour)
```promql
increase(security_events_total[1h])
```

---

## 🚀 Production Deployment

### Environment Variables

Add to `.env`:
```bash
# Telemetry Configuration
LOG_LEVEL=info  # error, warn, info, http, verbose, debug, silly
OTEL_SERVICE_NAME=bambisleep-church
OTEL_SERVICE_VERSION=1.0.0

# Optional: External OTEL Collector
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
```

### Prometheus Scrape Configuration

Add to `prometheus.yml`:
```yaml
scrape_configs:
  - job_name: 'bambisleep-church'
    static_configs:
      - targets: ['localhost:9464']
    scrape_interval: 15s
    scrape_timeout: 10s
```

### Docker Compose Integration

```yaml
services:
  bambisleep-church:
    # ... existing config
    environment:
      - LOG_LEVEL=info
    volumes:
      - ./logs:/app/logs
    ports:
      - "3000:3000"
      - "9464:9464"  # Prometheus metrics

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## 📝 Usage Examples

### Tracking Custom Business Metrics

```javascript
import { getMeter } from './services/telemetry.js';

const meter = getMeter();
const customMetric = meter.createCounter('custom_business_event', {
  description: 'Tracks custom business events'
});

// Increment the counter
customMetric.add(1, { event_type: 'feature_used', user_id: userId });
```

### Creating Custom Spans (Distributed Tracing)

```javascript
import { getTracer } from './services/telemetry.js';

const tracer = getTracer();

router.post('/complex-operation', async (req, res) => {
  const span = tracer.startSpan('complex_operation');
  
  try {
    span.setAttribute('user.id', req.user.id);
    
    // Your operation
    const result = await performComplexTask();
    
    span.setStatus({ code: 0 }); // Success
    res.json(result);
  } catch (error) {
    span.setStatus({ code: 2, message: error.message }); // Error
    throw error;
  } finally {
    span.end();
  }
});
```

### Querying Logs

```bash
# View all error logs
cat logs/error.log | jq 'select(.level == "error")'

# View authentication attempts
cat logs/combined.log | jq 'select(.message | contains("Authentication"))'

# View logs from specific user
cat logs/combined.log | jq 'select(.userId == "cus_abc123")'
```

---

## 🔧 Troubleshooting

### Metrics Not Appearing

1. **Check Prometheus endpoint**: `curl http://localhost:9464/metrics`
2. **Verify OpenTelemetry initialization**: Check startup logs for "OpenTelemetry SDK initialized"
3. **Check firewall**: Ensure port 9464 is open

### High Memory Usage

- Adjust metric cardinality (reduce unique label combinations)
- Increase metric aggregation intervals
- Enable histogram/summary quantile compression

### Missing Traces

- Verify `@opentelemetry/auto-instrumentations-node` is loaded before application code
- Check trace sampling rate (default: 100%)
- Ensure OTEL_EXPORTER_OTLP_ENDPOINT is accessible

---

## 📚 References

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [DORA Metrics Research](https://dora.dev/)
- [OWASP Attack Surface Management](https://owasp.org/www-project-attack-surface-management/)
- [Winston Logging Guide](https://github.com/winstonjs/winston)

---

*Organization*: BambiSleepChat  
*Repository*: <https://github.com/BambiSleepChat/bambisleep-church>  
*License*: MIT with BambiSleepChat attribution required
