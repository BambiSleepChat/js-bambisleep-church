# BambiSleep™ Church CatGirl Control Tower

> **Enterprise Express.js Platform** with OpenTelemetry Observability, Stripe Payments, and AI Agent Coordination

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js: 20+](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)
[![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-Instrumented-blue)](TELEMETRY.md)
[![Security: OWASP ASM](https://img.shields.io/badge/Security-OWASP%20ASM-red)](SECURITY.md)

---

## 🎯 What Is This?

**BambiSleep™ Church** is a production-ready Express.js web application featuring:

- **💳 Stripe Payment Gateway**: Subscription management, checkout sessions, webhook handling
- **📊 Enterprise Observability**: OpenTelemetry distributed tracing, Prometheus metrics, DORA metrics
- **🔐 Authentication & Authorization**: bcrypt password hashing, JWT tokens, subscription-based content gating
- **📹 Video Streaming**: Signed URL tokens, FFmpeg integration, secure video delivery
- **📝 Markdown Content Platform**: Public/private content rendering with `markdown-it`
- **🔌 Real-Time WebSocket**: Bidirectional messaging with JWT authentication
- **🤖 MCP Control Tower**: 8 Model Context Protocol servers for AI agent coordination

---

## 📦 Quick Start

### Prerequisites

- **Node.js 20+** (ES Modules required)
- **npm** or **yarn**
- **Docker** (optional, for containerized deployment)
- **Stripe Account** (for payment processing)

### Installation

```bash
# Clone repository
git clone https://github.com/BambiSleepChat/bambisleep-church.git
cd bambisleep-church

# Install dependencies (includes OpenTelemetry, Prometheus, bcrypt, Stripe)
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your API keys (Stripe, GitHub, HuggingFace)

# Start development server
npm run dev
```

Server runs at `http://localhost:3000`  
Prometheus metrics at `http://localhost:3000/metrics`  
DORA dashboard at `http://localhost:3000/dora`

---

## 🏗️ Architecture

### 5-Layer Dependency Lattice

```
Layer 0: Observability (telemetry.js)
         ├── OpenTelemetry SDK (auto-instrumentation)
         ├── Prometheus (20+ metrics: HTTP, auth, payments, DORA, security)
         └── Winston (structured JSON logging)
         
Layer 1: Server (server.js)
         ├── Express + WebSocket
         ├── Security: Helmet CSP, CORS, rate limiting
         └── Telemetry middleware integration
         
Layer 2: Routes (auth, stripe, markdown, video)
         ├── /auth/* - Registration, login, JWT tokens
         ├── /stripe/* - Checkout, webhooks, subscriptions
         ├── /markdown/* - Public/private content
         └── /video/* - Signed streaming URLs
         
Layer 3: Middleware (auth.js)
         ├── requireSubscription() - Stripe API verification
         ├── requireAuth() - JWT validation
         └── Video token signing/verification
         
Layer 4: Services (websocket.js)
         └── WebSocket state management (Map<clientId, metadata>)
```

---

## 📊 Observability

### Prometheus Metrics (20+)

```prometheus
# HTTP RED Pattern
http_requests_total{method, route, status_code}
http_request_duration_seconds{method, route}
http_requests_in_flight

# Authentication & Sessions
auth_attempts_total{type, outcome}
auth_sessions_active

# Stripe Payments
stripe_webhooks_total{event_type, status}
stripe_subscriptions_active
stripe_payment_value_total{currency}

# DORA Metrics
deployment_frequency
lead_time_seconds
change_failure_rate
mttr_seconds

# Security Monitoring
security_events_total{event_type, severity}
rate_limit_hits_total{route}
suspicious_activity_total{pattern}
```

**Full Documentation**: [TELEMETRY.md](TELEMETRY.md) | [SECURITY.md](SECURITY.md)

---

## 🛡️ Security Features

### Authentication
- **bcrypt** password hashing (10 rounds)
- **JWT** tokens (24-hour expiration)
- Express session cookies (`httpOnly`, `secure` in production)

### Attack Surface Management
- Helmet CSP headers
- Rate limiting (100 req/15min)
- Directory traversal protection
- SQL/XSS/command injection detection
- Stripe webhook signature verification

### Monitoring
- Security event tracking (suspicious patterns, failed auth attempts)
- Audit logging (structured JSON format)
- Real-time alerts via Prometheus

**Full Coverage**: [SECURITY.md](SECURITY.md) (OWASP ASM Top 10)

---

## 🤖 MCP Control Tower

8 Model Context Protocol servers for AI agent coordination:

```jsonc
filesystem      // File operations (workspace integration)
git             // Version control operations
github          // GitHub API (requires GITHUB_TOKEN)
mongodb         // Database operations (mongodb://localhost:27017)
stripe          // Payment API (requires STRIPE_SECRET_KEY)
huggingface     // ML models (requires HUGGINGFACE_HUB_TOKEN)
azure-quantum   // Quantum computing integration
clarity         // Analytics (requires CLARITY_PROJECT_ID)
```

**Configuration**: `.vscode/settings.json` | **Analysis**: `.vscode/MCP_CONFIG_NOTES.md`

---

## 🚀 Deployment

### Docker Compose (Production)

```bash
# Build and start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Access metrics
curl http://localhost:3000/metrics
```

### PM2 (Cluster Mode)

```bash
# Start with PM2
npm run pm2:start

# Monitor processes
pm2 monit

# View logs
pm2 logs
```

### Environment Variables

Required in `.env`:

```bash
NODE_ENV=production
SESSION_SECRET=<cryptographically-random-string>
JWT_SECRET=<cryptographically-random-string>
VIDEO_SIGNING_KEY=<random-signing-key>

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

GITHUB_TOKEN=ghp_...             # Optional (MCP)
HUGGINGFACE_HUB_TOKEN=hf_...     # Optional (MCP)
CLARITY_PROJECT_ID=...           # Optional (analytics)
```

---

## 📖 Documentation

- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - AI agent development guide (Six Genesis Questions)
- **[TELEMETRY.md](TELEMETRY.md)** - Complete observability architecture (400+ lines)
- **[SECURITY.md](SECURITY.md)** - Attack surface management guide (350+ lines)
- **[BUILD.md](BUILD.md)** - Build instructions and architecture decisions
- **[TODO.md](TODO.md)** - Project roadmap and known gaps
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

---

## 🧪 Testing

```bash
# Run tests with coverage (80% threshold)
npm test

# Watch mode
npm run test:watch

# Lint and format
npm run lint
npm run format
```

---

## 📝 Development Workflow

### VS Code Tasks (Emoji-Prefixed)

```
🌸 Install Dependencies
💎 Run Tests (100% Coverage)
💎 Lint Code
💎 Format Code
🌀 Build Project
✨ Start Control Tower (Dev)
🎭 Full Development Cycle
```

Access via: `Ctrl+Shift+P` → "Run Task"

### Git Commit Convention

```bash
🌸  Package management (npm install, dependencies)
👑  Architecture decisions (refactors, design)
💎  Quality metrics (tests, linting, coverage)
🦋  Transformations (migrations, docs)
✨  Server operations (deployment, MCP)
🎭  Development lifecycle (CI/CD, build)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Runtime** | Node.js (ES Modules) | 20+ |
| **Framework** | Express.js | 4.19.2 |
| **Telemetry** | OpenTelemetry SDK | 0.54.0+ |
| **Metrics** | Prometheus (prom-client) | 15.1.3 |
| **Logging** | Winston | 3.15.0 |
| **Auth** | bcrypt + jsonwebtoken | 5.1.1 + 9.0.2 |
| **Payments** | Stripe | 19.2.0 |
| **WebSocket** | ws | 8.18.0 |
| **Templates** | EJS | 3.1.10 |
| **Security** | Helmet + express-rate-limit | 7.1.0 + 7.4.0 |

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

**Trademark**: BambiSleep™ is a registered trademark. Code is open source, trademark use requires attribution.

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Follow emoji commit convention
4. Ensure tests pass (`npm test`)
5. Submit pull request

**AI Agents**: Read [.github/copilot-instructions.md](.github/copilot-instructions.md) first!

---

## 🔗 Links

- **Repository**: [BambiSleepChat/bambisleep-church](https://github.com/BambiSleepChat/bambisleep-church)
- **Issues**: [GitHub Issues](https://github.com/BambiSleepChat/bambisleep-church/issues)
- **Community**: [BambiSleep Chat](https://github.com/BambiSleepChat)

---

**Made with 💎 by the BambiSleep™ community** | Last Updated: 2025-01-11

