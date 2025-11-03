# 🎯 Quick Reference Guide

**BambiSleep™ Church** - MCP Control Tower | [GitHub Repository](https://github.com/BambiSleepChat/js-bambisleep-church)

---

## 🚀 Essential Commands (Via VS Code Tasks)

Press `Ctrl+Shift+P` → "Run Task" → Select:

```
🌸 Install Dependencies          # npm install
💎 Run Tests (100% Coverage)     # Jest with coverage
💎 Lint Code                     # ESLint check
💎 Format Code                   # Prettier format
✨ Start Control Tower (Dev)     # nodemon with hot reload
🌀 Build Project                 # lint + test
🎭 Full Development Cycle        # install → lint → test → build
```

---

## 📂 Project Structure

```
src/
├── server.js                    # Express app + WebSocket (247 lines)
├── middleware/
│   └── auth.js                  # JWT, subscriptions, video tokens (126 lines)
├── services/
│   ├── telemetry.js             # OpenTelemetry + Prometheus (450 lines)
│   └── websocket.js             # WebSocket server (255 lines)
└── routes/
    ├── auth.js                  # Registration, login, logout (160 lines)
    ├── stripe.js                # Payments, webhooks (177 lines)
    ├── markdown.js              # Content rendering (252 lines)
    └── video.js                 # Video streaming (120 lines)
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and configure:

**Required:**
- `SESSION_SECRET` - Express session secret
- `JWT_SECRET` - JWT signing key
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification

**Optional MCP Servers:**
- `GITHUB_TOKEN` - GitHub API access
- `HUGGINGFACE_HUB_TOKEN` - ML models
- `CLARITY_PROJECT_ID` - Analytics

---

## 🧪 Testing

**Run All Tests:**
```bash
NODE_OPTIONS='--experimental-vm-modules' jest --coverage
```

**Test Files:**
- `src/services/telemetry.test.js` - OpenTelemetry, Prometheus, Winston
- `src/services/websocket.test.js` - WebSocket lifecycle
- `src/middleware/auth.test.js` - JWT, subscription verification
- `src/routes/auth.test.js` - Registration, login
- `src/__tests__/smoke.test.js` - Module imports

**Coverage Threshold:** 80% statements/functions/lines, 70% branches

---

## 📊 Monitoring

**Start Monitoring Stack:**
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

**Access Points:**
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)
- Alertmanager: http://localhost:9093
- Application Metrics: http://localhost:9464/metrics

**Grafana Dashboards (6):**
1. HTTP RED Metrics (Rate, Errors, Duration)
2. DORA Metrics (Deployment frequency, lead time, CFR, MTTR)
3. Auth & Security (Login attempts, sessions, attacks)
4. Stripe Payments (Revenue, subscriptions, webhooks)
5. WebSocket Metrics (Connections, messages, auth)
6. Business Metrics (Content access, user growth)

---

## 🔐 Security Checklist

- ✅ Helmet CSP enabled
- ✅ CORS restricted to origin
- ✅ Rate limiting (100 req/15min)
- ✅ bcrypt password hashing (10 rounds)
- ✅ JWT 24-hour expiration
- ✅ Stripe webhook signature verification
- ✅ Directory traversal protection
- ✅ Video signed URLs (1-hour expiration)
- ✅ Session cookies: httpOnly, secure (production)

---

## 🎭 MCP Servers (8 Configured)

All configured in `.vscode/settings.json`:

1. **filesystem** - File operations
2. **git** - Version control
3. **github** - Repository management
4. **mongodb** - Database queries
5. **stripe** - Payment processing
6. **huggingface** - ML models
7. **azure-quantum** - Quantum computing
8. **clarity** - Analytics

---

## 📝 Git Commit Emojis

```
🌸  Package management (npm, dependencies)
👑  Architecture decisions
💎  Quality metrics (tests, linting)
🦋  Transformations (migrations, docs)
✨  Server operations (deployment, MCP)
🎭  Development lifecycle (CI/CD)
```

**Example:**
```bash
git commit -m "💎 Add Jest tests for telemetry service"
```

---

## 🚀 Deployment

**Docker:**
```bash
docker-compose up -d
```

**PM2:**
```bash
pm2 start ecosystem.config.js
pm2 logs
```

**Health Check:**
```bash
curl http://localhost:3000/health
```

---

## 🛠️ Troubleshooting

### PowerShell Execution Policy Error

Use VS Code tasks instead of npm commands directly, or:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Missing Dependencies

```bash
npm install
```

### Tests Failing

Ensure environment variables are set:
```bash
export JWT_SECRET=test-secret
export SESSION_SECRET=test-secret
export STRIPE_SECRET_KEY=sk_test_...
npm test
```

### Port Already in Use

Change port in `.env`:
```
PORT=3001
```

---

## 📚 Documentation Index

**Agent Guides:**
## 📖 Documentation

- `.github/codebase/architecture/architecture.md` - 8-layer architecture
- `.github/codebase/development/development.md` - Workflow, Windows/PowerShell
- `.github/codebase/integration/mcp-servers.md` - MCP configuration
- `.github/codebase/operations/monitoring.md` - Observability stack
- `.github/codebase/philosophy/philosophy.md` - 6 Genesis Questions

**Project Docs:**
- `BUILD.md` - Build instructions
- `SECURITY.md` - OWASP ASM compliance
- `TELEMETRY.md` - Observability architecture
- `DEPLOYMENT.md` - Production deployment
- `TODO.md` - Task tracking

---

## 🔗 Links

- **Repository:** https://github.com/BambiSleepChat/js-bambisleep-church
- **Organization:** https://github.com/BambiSleepChat
- **License:** MIT

---

## 📊 Metrics

- **Source Files:** 16
- **Test Files:** 5
- **Test Coverage Target:** 80%
- **Grafana Dashboards:** 6
- **Alert Rules:** 12
- **MCP Servers:** 8
- **Dependencies:** 20 production + 10 dev

---

**Status:** ✅ Production Ready

**Last Updated:** November 3, 2025
