# BambiSleep™ Church - AI Agent Instructions# BambiSleep™ Church - AI Agent Instructions# BambiSleep™ Church - AI Agent Instructions# BambiSleep™ Church - AI Agent Quick Guide



> **Express.js + Stripe + OpenTelemetry** | Node.js 20+ ES Modules | Windows/PowerShell Primary



**Full Documentation:** See `.github/codebase/` folder for comprehensive guides**Express.js + Stripe + OpenTelemetry** | Node.js 20+ ES Modules | Windows/PowerShell Primary



---



## 🎯 Quick Start---**Express.js + Stripe + OpenTelemetry** | Node.js 20+ ES Modules | Windows/PowerShell Primary**Express.js + Stripe + OpenTelemetry** | Node.js 20+ ES Modules



```bash

npm install                    # Install all dependencies

cp .env.example .env          # Configure: STRIPE_SECRET_KEY, JWT_SECRET, SESSION_SECRET**Full Documentation:** See `.github/codebase/` folder for comprehensive guides

npm run dev                   # nodemon with hot reload (.js, .ejs)

npm test                      # Jest (80% coverage threshold, requires NODE_OPTIONS='--experimental-vm-modules')

```

## 🎯 Quick Start---**Full Documentation:** See `.github/codebase/` folder for comprehensive guides

**Use VS Code Tasks:** `Ctrl+Shift+P` → "Run Task" → "💎 Run Tests (100% Coverage)" (bypasses PowerShell execution policy issues)



---

```bash

## ⚡ Critical Patterns (Will Break If Ignored)

npm install                    # Install all dependencies

### **1. ES Modules - ALWAYS include `.js` extension**

```javascriptcp .env.example .env          # Configure: STRIPE_SECRET_KEY, JWT_SECRET, SESSION_SECRET## 🎯 Quick Start## 🎯 Setup

// ✅ CORRECT

import { logger } from './services/telemetry.js';npm run dev                   # nodemon with hot reload (.js, .ejs)

import { requireAuth } from '../middleware/auth.js';

npm test                      # Jest (80% coverage threshold, requires NODE_OPTIONS='--experimental-vm-modules')

// ❌ BREAKS SILENTLY - Node.js won't find the module

import { logger } from './services/telemetry';```

```

```bash```bash

### **2. Telemetry-First Architecture - Instrument Everything**

```javascript**Use VS Code Tasks:** `Ctrl+Shift+P` → "Run Task" → "💎 Run Tests" (bypasses PowerShell execution policy issues)

// Every route/service must import and use telemetry

import { logger, trackAuthAttempt, trackStripeWebhook } from '../services/telemetry.js';npm install                    # Install all dependenciesnpm install                           # Install all dependencies



// Track operations for Prometheus metrics---

trackAuthAttempt('login', 'success', userId);

logger.info('User logged in', { userId, timestamp: Date.now() });cp .env.example .env          # Configure: STRIPE_SECRET_KEY, JWT_SECRET, SESSION_SECRETcp .env.example .env                  # Configure API keys (Stripe, GitHub, HuggingFace)

```

## ⚡ Critical Patterns (Will Break If Ignored)

### **3. Stripe Webhooks - Raw Body Parser Required**

```javascriptnpm run dev                   # nodemon with hot reload (.js, .ejs)npm run dev                           # Start development (nodemon)

// In server.js - BEFORE express.json() middleware

app.use('/stripe/webhook', express.raw({type: 'application/json'}));### **1. ES Modules - ALWAYS include `.js` extension**



// In routes/stripe.js - Verify signature with raw body```javascriptnpm test                      # Jest (80% coverage threshold, requires NODE_OPTIONS='--experimental-vm-modules')npm test                              # Jest with 80% coverage threshold

const sig = req.headers['stripe-signature'];

const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);// ✅ CORRECT

```

import { logger } from './services/telemetry.js';``````

### **4. Auth Middleware Chain - Order Matters**

```javascriptimport { requireAuth } from '../middleware/auth.js';

// Correct order: requireAuth → requireSubscription → handler

router.get('/premium-video', requireAuth, requireSubscription, videoHandler);



// requireSubscription checks Stripe API for active subscription// ❌ BREAKS SILENTLY - Node.js won't find the module

// Attaches req.subscription object if valid

```import { logger } from './services/telemetry';**Use VS Code Tasks:** `Ctrl+Shift+P` → "Run Task" → "💎 Run Tests" (bypasses PowerShell execution policy issues)## � Critical Patterns



### **5. Jest Tests - Mock Stripe/External APIs**```

```javascript

// Use jest.unstable_mockModule() for ES modules

jest.unstable_mockModule('stripe', () => ({

  default: jest.fn(() => ({ subscriptions: { list: jest.fn() } }))### **2. Telemetry-First Architecture - Instrument Everything**

}));

```javascript---**ES Modules** - ALL imports need `.js` extension:

// Then import AFTER mocking

const { requireSubscription } = await import('./auth.js');// Every route/service must import and use telemetry

```

import { logger, trackAuthAttempt, trackStripeWebhook } from '../services/telemetry.js';```javascript

---



## 🏗️ Architecture (8-Layer Dependency Lattice)

// Track operations for Prometheus metrics## ⚡ Critical Patterns (Will Break If Ignored)import { logger } from './services/telemetry.js';  // ✅ Correct

```

Layer 0: Configuration (.env, 26 variables)trackAuthAttempt('login', 'success', userId);

Layer 1: Server Initialization (server.js - Express + WebSocket + Security)

Layer 2: Middleware (auth.js - JWT, subscriptions, video tokens)logger.info('User logged in', { userId, timestamp: Date.now() });import { logger } from './services/telemetry';     // ❌ Breaks

Layer 3: Routes (auth, stripe, markdown, video - all telemetry-integrated)

Layer 4: Services (telemetry.js [450 lines], websocket.js [255 lines])```

Layer 5: External (Stripe API, markdown-it, bcrypt, jsonwebtoken)

Layer 6: MCP Servers (8 servers in .vscode/settings.json - DEV ONLY)### **1. ES Modules - ALWAYS include `.js` extension**```

Layer 7: UI (EJS templates, public/css, public/js)

```### **3. Stripe Webhooks - Raw Body Parser Required**



**Key Files:**```javascript```javascript

- `src/services/telemetry.js` - OpenTelemetry + Prometheus + Winston (20+ metrics)

- `src/middleware/auth.js` - requireAuth, requireSubscription, video token generation// In server.js - BEFORE express.json() middleware

- `src/server.js` - Middleware chain: helmet → cors → rate-limit → telemetry → auth

- `src/services/websocket.js` - Map<clientId, metadata> state managementapp.use('/stripe/webhook', express.raw({type: 'application/json'}));// ✅ CORRECT**Auth Middleware Chain**:



### **Middleware Chain (server.js)**

```javascript

helmet()                          // CSP headers// In routes/stripe.js - Verify signature with raw bodyimport { logger } from './services/telemetry.js';```javascript

cors()                            // Cross-origin control

rateLimit()                       // 100 req/15minconst sig = req.headers['stripe-signature'];

express.json()                    // Body parser (AFTER webhook route)

express.session()                 // Session cookies (httpOnly, secure)const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);import { requireAuth } from '../middleware/auth.js';router.get('/premium', requireAuth, requireSubscription, handler);

telemetryMiddleware()             // Prometheus metrics

securityMonitoringMiddleware()    // Attack detection```

morgan()                          // HTTP logging

``````



### **Route Endpoints**### **4. Auth Middleware Chain - Order Matters**

```javascript

// Auth Routes (src/routes/auth.js)```javascript// ❌ BREAKS SILENTLY - Node.js won't find the module

POST /auth/register               // bcrypt.hash(password, 10) + Stripe customer

POST /auth/login                  // bcrypt.compare() + JWT generation// Correct order: requireAuth → requireSubscription → handler

POST /auth/logout                 // Destroy session

GET  /auth/me                     // Current user (requires JWT)router.get('/premium-video', requireAuth, requireSubscription, videoHandler);import { logger } from './services/telemetry';**Stripe Webhooks** - Raw body parser required:



// Stripe Routes (src/routes/stripe.js)

POST /stripe/create-checkout-session    // Subscription checkout

POST /stripe/webhook                    // Payment events (raw body parser)// requireSubscription checks Stripe API for active subscription``````javascript

GET  /stripe/success                    // Checkout success redirect

GET  /stripe/cancel                     // Checkout cancel redirect// Attaches req.subscription object if valid



// Markdown Routes (src/routes/markdown.js)```app.use('/stripe/webhook', express.raw({type: 'application/json'}));

GET /markdown/public/:filename          // Public content (no auth)

GET /markdown/private/:filename         // Premium content (requireSubscription)



// Video Routes (src/routes/video.js)### **5. Jest Tests - Mock Stripe/External APIs**### **2. Telemetry-First Architecture - Instrument Everything**const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

GET /video/access/:videoId              // Generate signed URL token (1h expiry)

GET /video/stream/:videoId              // Stream video (verify token)```javascript

```

// Use jest.unstable_mockModule() for ES modules```javascript```

---

jest.unstable_mockModule('stripe', () => ({

## 🧪 Testing Conventions

  default: jest.fn(() => ({ subscriptions: { list: jest.fn() } }))// Every route/service must import and use telemetry

**Run Tests:** VS Code Task "💎 Run Tests (100% Coverage)" OR `npm test`

}));

**Test File Pattern:** `{name}.test.js` alongside source (e.g., `auth.js` → `auth.test.js`)

import { logger, trackAuthAttempt, trackStripeWebhook } from '../services/telemetry.js';**Telemetry** - Track all operations:

**Test Files:**

- `src/services/telemetry.test.js` - OpenTelemetry, Prometheus, Winston// Then import AFTER mocking

- `src/services/websocket.test.js` - WebSocket lifecycle, message routing

- `src/middleware/auth.test.js` - JWT, subscription verification, video tokensconst { requireSubscription } = await import('./auth.js');```javascript

- `src/routes/auth.test.js` - Registration, login, logout flows

- `src/__tests__/smoke.test.js` - Module import verification```



**Mocking External Services:**// Track operations for Prometheus metricsimport { logger, trackAuthAttempt } from '../services/telemetry.js';

```javascript

// Mock Stripe BEFORE importing module---

jest.unstable_mockModule('stripe', () => ({

  default: jest.fn(() => ({trackAuthAttempt('login', 'success', userId);trackAuthAttempt('login', 'success', userId);

    subscriptions: { list: jest.fn() },

    customers: { create: jest.fn() }## 🏗️ Architecture (8-Layer Dependency Lattice)

  }))

}));logger.info('User logged in', { userId, timestamp: Date.now() });logger.info('Operation completed', { userId });



const auth = await import('./auth.js');```



// Express req/res mocksLayer 0: Configuration (.env, 26 variables)``````

const req = { session: {}, headers: {}, body: {} };

const res = { Layer 1: Server Initialization (server.js - Express + WebSocket + Security)

  status: jest.fn().mockReturnThis(), 

  json: jest.fn(),Layer 2: Middleware (auth.js - JWT, subscriptions, video tokens)

  send: jest.fn()

};Layer 3: Routes (auth, stripe, markdown, video - all telemetry-integrated)

const next = jest.fn();

```Layer 4: Services (telemetry.js [450 lines], websocket.js [255 lines])### **3. Stripe Webhooks - Raw Body Parser Required**## 📁 Architecture



**Coverage Threshold:** 80% statements/functions/lines, 70% branches (configured in `package.json`)Layer 5: External (Stripe API, markdown-it, bcrypt, jsonwebtoken)



---Layer 6: MCP Servers (8 servers in .vscode/settings.json - DEV ONLY)```javascript



## 🚨 Common Failure ModesLayer 7: UI (EJS templates, public/css, public/js)



| Error | Cause | Fix |```// In server.js - BEFORE express.json() middleware```

|-------|-------|-----|

| `Cannot find module './telemetry'` | Missing `.js` extension | Add `.js` to ALL relative imports |

| `stripe.webhooks.constructEvent failed` | Used JSON body parser before webhook route | Use `express.raw()` for `/stripe/webhook` |

| `JWT_SECRET is not defined` | Missing `.env` file | Copy `.env.example` to `.env` |**Key Files:**app.use('/stripe/webhook', express.raw({type: 'application/json'}));src/services/telemetry.js  → OpenTelemetry + Prometheus + Winston

| `Tests fail with "require is not defined"` | Missing NODE_OPTIONS for Jest | Add `NODE_OPTIONS='--experimental-vm-modules'` |

| `No metrics at /metrics endpoint` | Forgot to import telemetry | Import `promRegistry` from `telemetry.js` |- `src/services/telemetry.js` - OpenTelemetry + Prometheus + Winston (20+ metrics)

| `Session cookie not set` | Missing `SESSION_SECRET` | Set in `.env` (cryptographically random) |

| `Directory traversal in markdown` | No filename validation | Validate filename doesn't contain `..` or `/` |- `src/middleware/auth.js` - requireAuth, requireSubscription, video token generationsrc/server.js              → Express setup, middleware chain

| `WebSocket auth fails` | No JWT in connection | Pass `?token=<jwt>` in WebSocket URL |

- `src/server.js` - Middleware chain: helmet → cors → rate-limit → telemetry → auth

---

- `src/services/websocket.js` - Map<clientId, metadata> state management// In routes/stripe.js - Verify signature with raw bodysrc/routes/                → auth, stripe, markdown, video (all instrumented)

## 📊 Observability & Monitoring



### **Prometheus Metrics (20+ Metrics)**

```prometheus---const sig = req.headers['stripe-signature'];src/middleware/auth.js     → requireAuth, requireSubscription

# HTTP RED Pattern

http_requests_total{method, route, status_code}

http_request_duration_seconds{method, route}

http_requests_errors_total{method, route, type}## 🧪 Testing Conventionsconst event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);src/services/websocket.js  → WebSocket state (Map<clientId, metadata>)



# Authentication & Security

auth_attempts_total{type="login|register|jwt", outcome="success|failure"}

auth_active_sessions**Run Tests:** VS Code Task "💎 Run Tests (100% Coverage)" OR `npm test```````

security_events_total{type="directory_traversal|xss|sql_injection|..."}



# Business Metrics

stripe_payment_value_total                        # Revenue in cents**Test File Pattern:** `{name}.test.js` alongside source (e.g., `auth.js` → `auth.test.js`)

stripe_subscriptions_active                       # Active subscribers

content_access_total{type="public|private", path} # Content views

video_stream_duration_seconds                     # Watch time

**Mocking External Services:**### **4. Auth Middleware Chain - Order Matters**## 🚨 Common Errors

# DORA Metrics

deployment_frequency_total```javascript

deployment_lead_time_seconds

change_failure_rate// Mock Stripe BEFORE importing module```javascript

mttr_seconds

jest.unstable_mockModule('stripe', () => ({ /* mock */ }));

# WebSocket

websocket_connections_totalconst auth = await import('./auth.js');// Correct order: requireAuth → requireSubscription → handler1. Missing `.js` in imports → Silent failure

websocket_messages_total{type="auth|chat|ping"}

```



### **Grafana Dashboards (6 Total)**// Express req/res mocksrouter.get('/premium-video', requireAuth, requireSubscription, videoHandler);2. Stripe webhook without `express.raw()` → Signature fails

1. **HTTP RED Metrics** - Rate, Errors, Duration

2. **DORA Metrics** - Deployment frequency, lead time, CFR, MTTRconst req = { session: {}, headers: {} };

3. **Auth & Security** - Login attempts, sessions, security events

4. **Stripe Payments** - Revenue, subscriptions, webhooksconst res = { status: jest.fn().mockReturnThis(), json: jest.fn() };3. Missing `.env` file → Undefined config

5. **WebSocket Metrics** - Connections, messages, auth flow

6. **Business Metrics** - Content access, user growth, video streamsconst next = jest.fn();



**Access:** `http://localhost:3001` (default: admin/admin)```// requireSubscription checks Stripe API for active subscription4. Forgot telemetry imports → No metrics collected



### **Start Monitoring Stack**

```bash

docker-compose -f docker-compose.monitoring.yml up -d**Coverage Threshold:** 80% (configured in `package.json` → jest.coverageThreshold)// Attaches req.subscription object if valid

# Deploys: Prometheus (9090), Grafana (3001), Alertmanager (9093), Node Exporter (9100)

```



------```## 📖 Deep Dive



## 🛡️ Security Patterns



### **Authentication Flow**## 🚨 Common Failure Modes

1. User registers → `bcrypt.hash(password, 10)` → creates Stripe customer

2. Login → `bcrypt.compare()` → generates JWT (24h expiry) → sets session cookie

3. Protected routes → `requireAuth()` validates JWT → attaches `req.user`

4. Subscription routes → `requireSubscription()` calls Stripe API| Error | Cause | Fix |### **5. Jest Tests - Mock Stripe/External APIs****Comprehensive Documentation:** `.github/codebase/`



### **Content Security Policy (Helmet)**|-------|-------|-----|

```javascript

helmet({| `Cannot find module './telemetry'` | Missing `.js` extension | Add `.js` to ALL relative imports |```javascript

  contentSecurityPolicy: {

    directives: {| `stripe.webhooks.constructEvent failed` | Used JSON body parser before webhook route | Use `express.raw()` for `/stripe/webhook` |

      defaultSrc: ["'self'"],

      scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],| `JWT_SECRET is not defined` | Missing `.env` file | Copy `.env.example` to `.env` |// Use jest.unstable_mockModule() for ES modules**Architecture & Design:** `codebase/architecture/`

      styleSrc: ["'self'", "'unsafe-inline'"],

      frameSrc: ['https://js.stripe.com'],| `Tests fail with "require is not defined"` | Missing NODE_OPTIONS for Jest | Add `NODE_OPTIONS='--experimental-vm-modules'` |

      connectSrc: ["'self'", 'wss:', 'ws:'],

      imgSrc: ["'self'", 'data:', 'https:'],| `No metrics at /metrics endpoint` | Forgot to import telemetry | Import `promRegistry` from `telemetry.js` |jest.unstable_mockModule('stripe', () => ({- `architecture.md` - 8-layer dependency lattice, security patterns

      mediaSrc: ["'self'", 'blob:']

    }

  }

})---  default: jest.fn(() => ({ subscriptions: { list: jest.fn() } }))

```



### **Rate Limiting**

```javascript## 🪟 Windows/PowerShell Specifics}));**Development:** `codebase/development/`

rateLimit({

  windowMs: 15 * 60 * 1000,  // 15 minutes

  max: 100,                   // Limit each IP to 100 requests per window

  message: 'Too many requests from this IP, please try again later.'- **Execution Policy:** Use VS Code tasks (bypasses restrictions) OR `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`- `development.md` - VS Code workflows, testing, Windows/PowerShell

})

```- **Path Handling:** Node.js code uses forward slashes (`/`) even on Windows



### **Directory Traversal Protection**- **WSL Paths:** MCP servers may need `/mnt/f/bambisleep-church` (Windows F: drive)// Then import AFTER mocking

```javascript

// In routes/markdown.js- **Line Endings:** Git configured for `core.autocrlf=true` (LF in repo, CRLF on checkout)

const filename = req.params.filename;

if (filename.includes('..') || filename.includes('/')) {const { requireSubscription } = await import('./auth.js');**Integration:** `codebase/integration/`

  return res.status(400).json({ error: 'Invalid filename' });

}---

```

```- `mcp-servers.md` - 8 MCP servers, AI agent coordination

### **Video Token Signing (1-hour expiration)**

```javascript## 🤖 MCP Integration (Development Only)

// generateVideoToken(videoId) in middleware/auth.js

const token = jwt.sign(

  { videoId, exp: Math.floor(Date.now() / 1000) + 3600 },

  process.env.VIDEO_SIGNING_KEY**8 MCP Servers Configured** (`.vscode/settings.json`):

);

```- `filesystem`, `git`, `github` (needs GITHUB_TOKEN)---**Operations:** `codebase/operations/`



---- `mongodb`, `stripe` (needs STRIPE_SECRET_KEY)



## 🪟 Windows/PowerShell Specifics- `huggingface` (needs HUGGINGFACE_HUB_TOKEN)- `monitoring.md` - Prometheus, Grafana (6 dashboards), alerts



### **PowerShell Execution Policy**- `azure-quantum`, `clarity` (needs CLARITY_PROJECT_ID)

If you see "running scripts is disabled":

```powershell## 🏗️ Architecture (8-Layer Dependency Lattice)

# Option 1: Set for current user (recommended)

Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser**Note:** MCP servers are VS Code extensions for AI agents — they do NOT run in production.



# Option 2: Bypass for single session**Philosophy:** `codebase/philosophy/`

powershell -ExecutionPolicy Bypass -File script.ps1

---

# Option 3: Use VS Code tasks instead (they bypass this issue)

``````- `philosophy.md` - The 6 Genesis Questions, system intent



### **Path Handling**## 📖 Extended Documentation

- **Windows paths:** `F:\bambisleep-church` (native)

- **WSL paths:** `/mnt/f/bambisleep-church` (for MCP servers)Layer 0: Configuration (.env, 26 variables)

- **Node.js code:** Use forward slashes `/` (works on both Windows/Linux)

**All comprehensive guides:** `.github/codebase/`

### **Common Windows Issues**

| Issue | Solution |- `architecture/architecture.md` - 8-layer lattice, security patterns, failure modesLayer 1: Server Initialization (server.js - Express + WebSocket + Security)**Reference:** `codebase/reference/`

|-------|----------|

| `npm` not recognized | Add Node.js to PATH or restart VS Code |- `development/development.md` - VS Code workflows, emoji git commits, Windows notes

| `ENOENT` errors | Use absolute paths or `path.join()` |

| Line endings | `git config core.autocrlf true` |- `integration/mcp-servers.md` - AI agent coordination, practical examplesLayer 2: Middleware (auth.js - JWT, subscriptions, video tokens)- `QUICK_REFERENCE.md` - Commands, setup, troubleshooting

| Permission denied | Run VS Code as administrator |

- `operations/monitoring.md` - Prometheus, Grafana (6 dashboards), alerting

---

- `philosophy/philosophy.md` - The 6 Genesis Questions, system intentLayer 3: Routes (auth, stripe, markdown, video - all telemetry-integrated)- `COMPLETION_REPORT.md` - Full verification status

## 🤖 MCP Integration (Development Only)

- `reference/QUICK_REFERENCE.md` - Commands, troubleshooting, environment variables

**8 MCP Servers Configured** (`.vscode/settings.json`):

```javascriptLayer 4: Services (telemetry.js [450 lines], websocket.js [255 lines])

filesystem      // File operations (/mnt/f/bambisleep-church)Layer 5: External (Stripe API, markdown-it, bcrypt, jsonwebtoken)

git             // Version controlLayer 6: MCP Servers (8 servers in .vscode/settings.json - DEV ONLY)

github          // Requires GITHUB_TOKEN env varLayer 7: UI (EJS templates, public/css, public/js)

mongodb         // Requires mongodb://localhost:27017```

stripe          // Requires STRIPE_SECRET_KEY env var

huggingface     // Requires HUGGINGFACE_HUB_TOKEN env var**Key Files:**

azure-quantum   // Quantum computing (requires workspace config)- `src/services/telemetry.js` - OpenTelemetry + Prometheus + Winston (20+ metrics)

clarity         // Analytics (requires CLARITY_PROJECT_ID env var)- `src/middleware/auth.js` - requireAuth, requireSubscription, video token generation

```- `src/server.js` - Middleware chain: helmet → cors → rate-limit → telemetry → auth

- `src/services/websocket.js` - Map<clientId, metadata> state management

**Important:** MCP servers are **development tools only** (VS Code extensions) — they do NOT run in production.

---

### **Practical AI Agent Examples**

```javascript## 🧪 Testing Conventions

// Filesystem Server - Read/write project files

// Example: "Show me all routes that use requireAuth middleware"**Run Tests:** VS Code Task "💎 Run Tests (100% Coverage)" OR `npm test`

// → Server searches src/routes/*.js for requireAuth imports

**Test File Pattern:** `{name}.test.js` alongside source (e.g., `auth.js` → `auth.test.js`)

// GitHub Server - Repository management

// Example: "Find all TODOs in BambiSleepChat/bambisleep-church"**Mocking External Services:**

// → Server uses GitHub Code Search API```javascript

// Mock Stripe BEFORE importing module

// Stripe Server - Payment operationsjest.unstable_mockModule('stripe', () => ({ /* mock */ }));

// Example: "Show active subscriptions for user@example.com"const auth = await import('./auth.js');

// → Server calls: stripe.subscriptions.list({customer: customerId, status: 'active'})

```// Express req/res mocks

const req = { session: {}, headers: {} };

---const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

const next = jest.fn();

## 🎨 Git Commit Conventions (Emoji-Driven)```



```bash**Coverage Threshold:** 80% (configured in `package.json` → jest.coverageThreshold)

🌸  Package management (npm install, dependency updates)

👑  Architecture decisions (refactors, design changes)---

💎  Quality metrics (tests, linting, coverage)

🦋  Transformations (migrations, docs)## 🚨 Common Failure Modes

✨  Server operations (deployment, MCP)

🎭  Development lifecycle (CI/CD)| Error | Cause | Fix |

|-------|-------|-----|

# Examples:| `Cannot find module './telemetry'` | Missing `.js` extension | Add `.js` to ALL relative imports |

git commit -m "🌸 Add missing bcrypt dependency to package.json"| `stripe.webhooks.constructEvent failed` | Used JSON body parser before webhook route | Use `express.raw()` for `/stripe/webhook` |

git commit -m "💎 Add Jest tests for WebSocket service"| `JWT_SECRET is not defined` | Missing `.env` file | Copy `.env.example` to `.env` |

git commit -m "👑 Refactor authentication middleware architecture"| `Tests fail with "require is not defined"` | Missing NODE_OPTIONS for Jest | Add `NODE_OPTIONS='--experimental-vm-modules'` |

```| `No metrics at /metrics endpoint` | Forgot to import telemetry | Import `promRegistry` from `telemetry.js` |



------



## 📦 Deployment## 🪟 Windows/PowerShell Specifics



### **Docker**- **Execution Policy:** Use VS Code tasks (bypasses restrictions) OR `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

```bash- **Path Handling:** Node.js code uses forward slashes (`/`) even on Windows

docker-compose up -d    # PM2 cluster mode- **WSL Paths:** MCP servers may need `/mnt/f/bambisleep-church` (Windows F: drive)

                        # Mounts: ./videos:/app/videos, ./content:/app/content- **Line Endings:** Git configured for `core.autocrlf=true` (LF in repo, CRLF on checkout)

```

---

### **PM2 (Production)**

```bash## 🤖 MCP Integration (Development Only)

pm2 start ecosystem.config.js  # Cluster mode, max instances, 1GB memory limit

pm2 logs                       # Check logs/pm2-*.log**8 MCP Servers Configured** (`.vscode/settings.json`):

pm2 stop all                   # Stop all processes- `filesystem`, `git`, `github` (needs GITHUB_TOKEN)

```- `mongodb`, `stripe` (needs STRIPE_SECRET_KEY)

- `huggingface` (needs HUGGINGFACE_HUB_TOKEN)

### **Environment Requirements**- `azure-quantum`, `clarity` (needs CLARITY_PROJECT_ID)

```bash

NODE_ENV=production**Note:** MCP servers are VS Code extensions for AI agents — they do NOT run in production.

SESSION_SECRET=<cryptographically-random>

JWT_SECRET=<cryptographically-random>---

STRIPE_SECRET_KEY=sk_live_...

STRIPE_WEBHOOK_SECRET=whsec_...## 📖 Extended Documentation

VIDEO_SIGNING_KEY=<random-secret>

```**All comprehensive guides:** `.github/codebase/`

- `architecture/architecture.md` - 8-layer lattice, security patterns, failure modes

### **Health Checks**- `development/development.md` - VS Code workflows, emoji git commits, Windows notes

```bash- `integration/mcp-servers.md` - AI agent coordination, practical examples

curl http://localhost:3000/health          # Application- `operations/monitoring.md` - Prometheus, Grafana (6 dashboards), alerting

curl http://localhost:9090/-/healthy       # Prometheus- `philosophy/philosophy.md` - The 6 Genesis Questions, system intent

curl http://localhost:3001/api/health      # Grafana- `reference/QUICK_REFERENCE.md` - Commands, troubleshooting, environment variables

```

---

## ⚠️ Sacred Invariants (Never Change)

### **Architecture Invariants**
- **ES Modules:** `"type": "module"` — all imports use `.js` extensions
- **4 Core Routes:** `/auth`, `/markdown`, `/stripe`, `/video`
- **Subscription Middleware:** `requireSubscription()` MUST verify Stripe API
- **WebSocket Format:** `{ type: string, ...payload }`
- **Session Security:** `httpOnly: true`, `secure: true` in production
- **Rate Limiting:** 100 req/15min per IP

### **Content Security Invariants**
- **Directory Protection:** `content/public/` vs `content/private/`
- **Stripe Webhooks:** ALL events MUST verify `stripe-signature` header
- **JWT Expiration:** 24-hour limit
- **Video Tokens:** 1-hour signed URL expiration

### **MCP Integration Invariants**
- **8 MCP Servers:** filesystem, git, github, mongodb, stripe, huggingface, azure-quantum, clarity
- **npx -y Pattern:** All use `npx -y @modelcontextprotocol/server-{name}`

---

## 📖 Extended Documentation

**Comprehensive Guides:** `.github/codebase/`

### **Architecture & Design**
- `architecture/architecture.md` (218 lines) - 8-layer lattice, security patterns, failure modes, emergent patterns

### **Development Guides**
- `development/development.md` (145 lines) - VS Code workflows, emoji commits, Windows/PowerShell, testing philosophy

### **MCP Integration**
- `integration/mcp-servers.md` (134 lines) - AI agent coordination, 8 server configurations, practical examples

### **Operations & Observability**
- `operations/monitoring.md` (232 lines) - Prometheus, Grafana (6 dashboards), 12 alert rules, DORA metrics

### **Philosophy & Intent**
- `philosophy/philosophy.md` (126 lines) - The 6 Genesis Questions (What/Why/Invariants/Learnings/Feelings/Failures)

### **Quick Reference**
- `reference/QUICK_REFERENCE.md` (244 lines) - Commands, environment variables, troubleshooting, metrics
- `reference/COMPLETION_REPORT.md` - Full verification report, architecture compliance

---

## 🔗 Additional Resources

**Project Documentation:**
- `BUILD.md` - Build instructions and development workflow
- `SECURITY.md` (350+ lines) - OWASP ASM compliance, attack surface management
- `TELEMETRY.md` (497 lines) - Complete observability architecture
- `DEPLOYMENT.md` - Production deployment guide
- `TODO.md` - Task tracking and roadmap

**Organization:**
- **Repository:** https://github.com/BambiSleepChat/js-bambisleep-church
- **Organization:** https://github.com/BambiSleepChat
- **License:** MIT
- **Trademark:** BambiSleep™ is a trademark of BambiSleepChat

---

**Status:** ✅ Production Ready | **Last Updated:** November 3, 2025
