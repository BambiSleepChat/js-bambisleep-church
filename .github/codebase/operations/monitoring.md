# Monitoring Stack & Observability

## 📊 Monitoring Infrastructure

### **Deployment**

```bash
docker-compose -f docker-compose.monitoring.yml up -d
# Deploys: Prometheus (9090), Grafana (3001), Alertmanager (9093), Node Exporter (9100)
```

### **Components**

- **Prometheus** (`prometheus/prometheus.yml`) - Scrapes `/metrics` every 15s, loads 12 alert rules
- **Grafana** - 6 pre-configured dashboards (HTTP RED, DORA, auth/security, Stripe, WebSocket, business)
- **Alertmanager** (`alertmanager/alertmanager.yml`) - Routes alerts to Slack (3 channels)
- **Node Exporter** - Host metrics (CPU, memory, disk, network)

---

## 📈 Grafana Dashboards (6 Total)

1. **http-red-metrics.json** - Rate, Errors, Duration (RED pattern)
2. **dora-metrics.json** - Deployment frequency, lead time, CFR, MTTR
3. **auth-security.json** - Auth attempts, sessions, security events
4. **stripe-payments.json** - Revenue, subscriptions, webhooks
5. **websocket-metrics.json** - Connections, messages, auth flow
6. **business-metrics.json** - Content access, user growth, video streams

**Access**: `http://localhost:3001` (default credentials: admin/admin)

---

## 🚨 Alert Rules (12 Total)

**File**: `prometheus/alerts/bambisleep.yml`

### **Performance Alerts**

- High error rate (>5%)
- Slow response time (p95 >1s)

### **Security Alerts**

- Auth failures (>10/5min)
- Directory traversal attempts

### **DORA Alerts**

- Low deployment frequency
- High change failure rate

### **Business Alerts**

- Subscription failures
- Stripe webhook errors

**Slack Channels**: Critical (#alerts-critical), Warnings (#alerts-warnings), General (#alerts-general)

---

## 📊 Key Prometheus Metrics (20+)

### **HTTP RED Pattern**

```prometheus
http_requests_total{method, route, status}           # Counter: Total requests
http_request_duration_seconds{method, route}         # Histogram: Latency distribution
http_requests_errors_total{method, route, type}      # Counter: Error tracking
```

### **Authentication & Security**

```prometheus
auth_attempts_total{type="login|register|jwt"}       # Counter: Auth operations
auth_active_sessions                                  # Gauge: Current sessions
security_events_total{type="directory_traversal|...} # Counter: Attack detection
```

### **Business Metrics**

```prometheus
stripe_payment_value_total                           # Counter: Revenue (cents)
stripe_subscriptions_active                          # Gauge: Active subscribers
content_access_total{type="public|private", path}    # Counter: Content views
video_stream_duration_seconds                        # Histogram: Watch time
```

### **DORA Metrics**

```prometheus
deployment_frequency_total                           # Counter: Deployments
deployment_lead_time_seconds                         # Histogram: Commit → deploy
change_failure_rate                                  # Gauge: Failed deployments %
mttr_seconds                                         # Histogram: Mean time to recovery
```

### **WebSocket**

```prometheus
websocket_connections_total                          # Gauge: Active connections
websocket_messages_total{type="auth|chat|ping"}      # Counter: Message flow
```

---

## 🔍 Example PromQL Queries

### **95th percentile response time (last 5m)**

```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### **Error rate percentage**

```promql
rate(http_requests_errors_total[5m]) / rate(http_requests_total[5m]) * 100
```

### **Revenue per hour**

```promql
rate(stripe_payment_value_total[1h]) * 3600 / 100
```

### **Failed auth attempts (security monitoring)**

```promql
increase(auth_attempts_total{type="login", success="false"}[5m])
```

---

## ✅ Phase 5: Production Deployment Validation

### **1. Deploy Monitoring Stack**

```bash
docker-compose -f docker-compose.monitoring.yml up -d
# Verify all containers running
docker-compose -f docker-compose.monitoring.yml ps
```

### **2. Configure Slack Webhooks**

```bash
# Set in alertmanager/alertmanager.yml or via environment variable
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
docker-compose -f docker-compose.monitoring.yml restart alertmanager
```

### **3. Verify Prometheus Scraping**

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job, health, lastError}'

# Verify metrics endpoint responds
curl http://localhost:3000/metrics | grep "http_requests_total"

# Test DORA metrics endpoint
curl http://localhost:3000/dora
```

### **4. Verify Grafana Dashboards**

```bash
# Access Grafana (default credentials: admin/admin)
open http://localhost:3001

# Verify all 6 dashboards load:
# - HTTP RED Metrics
# - DORA Metrics  
# - Auth & Security
# - Stripe Payments
# - WebSocket Metrics
# - Business Metrics
```

### **5. Test Alert Firing**

```bash
# Trigger high error rate alert (send 100 failed requests)
for i in {1..100}; do curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"invalid","password":"wrong"}'; done

# Check Alertmanager UI for firing alerts
open http://localhost:9093

# Verify Slack notification received (if configured)
```

### **6. Load Testing with k6**

```bash
# Install k6 (Windows)
choco install k6
# Or download from https://k6.io/docs/getting-started/installation/

# Run load test (see DEPLOYMENT.md for test scripts)
k6 run --vus 10 --duration 30s loadtest.js

# Monitor metrics during load test
watch -n 1 'curl -s http://localhost:9090/api/v1/query?query=rate(http_requests_total[1m])'
```

### **7. Production Health Checks**

```bash
# Application health
curl http://localhost:3000/health

# Prometheus health
curl http://localhost:9090/-/healthy

# Grafana health  
curl http://localhost:3001/api/health

# Node Exporter metrics
curl http://localhost:9100/metrics | head -20
```

---

## 📖 Additional Resources

- **TELEMETRY.md** (497 lines) - Complete observability architecture
- **SECURITY.md** (350+ lines) - OWASP attack surface management
- **DEPLOYMENT.md** - Full production deployment guide
