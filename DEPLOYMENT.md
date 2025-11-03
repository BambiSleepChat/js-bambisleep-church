# BambiSleep™ Church - Deployment Guide

**Version:** 3.0.0 (Enterprise Observability)  
**Last Updated:** 2025-11-03

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# 4. Start application
npm run dev  # Development
npm start    # Production
```

---

## 🐳 Monitoring Stack Deployment

### Prerequisites
- Docker & Docker Compose installed
- Ports available: 3000 (app), 9090 (Prometheus), 3001 (Grafana), 9093 (Alertmanager)

### Start Monitoring Infrastructure

```bash
cd f:\bambisleep-church
docker-compose -f docker-compose.monitoring.yml up -d
```

**Services Started:**
- **Prometheus** (9090) - Metrics collection, 30-day retention
- **Grafana** (3001) - Visualization + 6 pre-configured dashboards
- **Node Exporter** (9100) - System metrics
- **Alertmanager** (9093) - Alert routing to Slack

### Configure Slack Alerts

```bash
# Set webhook URL
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Restart alertmanager
docker-compose -f docker-compose.monitoring.yml restart alertmanager
```

### Verify Deployment

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets'

# Check application metrics
curl http://localhost:3000/metrics | head -20

# Access UIs
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin)
# Alertmanager: http://localhost:9093
```

---

## 📊 Grafana Dashboards (6 Pre-configured)

All dashboards are auto-provisioned on startup:

1. **HTTP RED Metrics** - Request rate, errors, duration (5 panels)
2. **DORA Metrics** - Deployment frequency, lead time, CFR, MTTR (6 panels)
3. **Authentication & Security** - Auth attempts, security events (9 panels)
4. **Stripe Payments & Revenue** - Revenue tracking, subscriptions (9 panels)
5. **WebSocket Real-Time** - Connections, messages (9 panels)
6. **Business Metrics** - User growth, content access (11 panels)

Access at: <http://localhost:3001>

---

## 🔧 Application Deployment

### Development Mode

```bash
npm run dev
# Server starts on http://localhost:3000
# Auto-reloads on .js/.ejs file changes
```

### Production Mode (PM2)

```bash
# Using PM2 for process management
npm run pm2:start

# Or with ecosystem config
pm2 start ecosystem.config.js

# Check logs
pm2 logs bambisleep-church
```

### Docker Deployment

```bash
# Build image
docker build -t bambisleep-church:latest .

# Start application + monitoring
docker-compose up -d
```

---

## ⚙️ Environment Configuration

### Required Variables

```bash
# Application
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Authentication
JWT_SECRET=your-secure-random-string-here
SESSION_SECRET=another-secure-random-string

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# GitHub Integration (for MCP)
GITHUB_TOKEN=ghp_...

# HuggingFace AI/ML (for MCP)
HUGGINGFACE_HUB_TOKEN=hf_...

# Video Signing
VIDEO_SIGNING_KEY=video-token-secret-key
```

### Optional Variables

```bash
# Azure Quantum (MCP)
AZURE_QUANTUM_WORKSPACE_ID=...
AZURE_QUANTUM_SUBSCRIPTION_ID=...

# Microsoft Clarity Analytics (MCP)
CLARITY_PROJECT_ID=...

# Grafana
GRAFANA_ADMIN_PASSWORD=secure-password

# Slack Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

---

## 🧪 Health Checks

### Application Health

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "uptime": 12345,
  "timestamp": "2025-11-03T..."
}
```

### Metrics Endpoint

```bash
curl http://localhost:3000/metrics
```

**Should include:**
- `http_requests_total` - Request counter
- `stripe_subscriptions_active` - Subscription gauge
- `websocket_connections_active` - Active connections
- `video_streams_total` - Video stream counter

### DORA Metrics

```bash
curl http://localhost:3000/dora
```

**Returns:**
- Deployment frequency
- Lead time for changes
- Change failure rate
- Mean time to recovery

---

## 🔍 Troubleshooting

### Monitoring Stack Issues

**Prometheus not scraping:**
```bash
# Check Prometheus logs
docker logs bambisleep-prometheus

# Verify target connectivity
docker exec bambisleep-prometheus wget -O- http://host.docker.internal:3000/metrics
```

**Grafana dashboards missing:**
```bash
# Check provisioning
docker exec bambisleep-grafana ls -la /etc/grafana/provisioning/dashboards/

# Restart Grafana
docker-compose -f docker-compose.monitoring.yml restart grafana
```

**Alerts not firing:**
```bash
# Check alert rules
curl http://localhost:9090/api/v1/rules

# Check Alertmanager status
curl http://localhost:9093/api/v1/status
```

### Application Issues

**Port already in use:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <pid> /F
```

**Missing dependencies:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**WebSocket connection fails:**
- Check `HOST` environment variable (use `0.0.0.0` for external access)
- Verify firewall allows port 3000
- Check WebSocket upgrade headers in logs

---

## 📈 Load Testing

### Using k6

```bash
# Install k6
# https://k6.io/docs/get-started/installation/

# Create test script
cat > test.js << 'EOF'
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  const res = http.get('http://localhost:3000/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
}
EOF

# Run test
k6 run test.js

# Monitor in Grafana HTTP RED dashboard
```

---

## 🔐 Security Checklist

Before production deployment:

- [ ] Change default Grafana password
- [ ] Set `secure: true` for session cookies (HTTPS only)
- [ ] Use cryptographically random `JWT_SECRET` and `SESSION_SECRET`
- [ ] Verify `STRIPE_WEBHOOK_SECRET` is configured
- [ ] Set `NODE_ENV=production`
- [ ] Review CSP headers in `src/server.js`
- [ ] Enable rate limiting (already configured: 100 req/15min)
- [ ] Configure Slack webhook for critical alerts
- [ ] Set up backup for Prometheus/Grafana data volumes

---

## 📝 Monitoring Best Practices

### Alert Thresholds

Default thresholds are configured in `prometheus/alerts/bambisleep.yml`:

- **HighErrorRate**: >5% (critical)
- **HighResponseTime**: p95 >2s (warning)
- **HighAuthenticationFailures**: >10/s (warning)
- **StripeWebhookFailures**: Any failure (critical)
- **SecurityEventsDetected**: >5/s (critical)

Adjust based on your traffic patterns.

### Dashboard Refresh Rates

- HTTP RED: 30s (real-time performance)
- DORA Metrics: 1m (trend analysis)
- Security: 30s (threat detection)
- Business Metrics: 1m (analytics)

### Data Retention

- **Prometheus**: 30 days (configurable in docker-compose.monitoring.yml)
- **Grafana**: Persistent via Docker volume
- **Logs**: Rotate daily (Winston configuration)

---

## 🆘 Support

**Documentation:**
- Architecture: `.github/copilot-instructions.md`
- Telemetry: `TELEMETRY.md`
- Security: `SECURITY.md`
- Project Status: `TODO.md`

**Repository:** <https://github.com/BambiSleepChat/bambisleep-church>  
**License:** MIT  
**Organization:** BambiSleepChat
