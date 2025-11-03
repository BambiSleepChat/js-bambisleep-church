# Architecture & Layer Dependencies

## 🏗️ 8-Layer Dependency Lattice

*Inspired by CodeCraft's emergent 8-layer architecture - applied to Express.js*

### **Layer 0: Configuration Primitives** (Foundation)
```
.env.example          # Environment template (26 variables)
src/config/           # Centralized configuration (future)
```
**Purpose**: Single source of truth for environment-aware configuration  
**Depends On**: Nothing (bootstrap layer)  
**Used By**: All other layers

### **Layer 1: Server Initialization** (Core Runtime)
```javascript
src/server.js (247 lines)
├── Express app creation
├── HTTP server + WebSocket server
├── Security middleware (helmet, cors, rate-limit)
├── Session management (express-session, 24h cookies)
└── Route registration
```
**Purpose**: Bootstrap the application, wire up middleware chain  
**Depends On**: Layer 0 (environment variables)  
**Used By**: Layers 2-7

### **Layer 2: Middleware Layer** (Guards & Transforms)
```javascript
src/middleware/auth.js (126 lines)
├── requireSubscription()  # Stripe API verification
├── requireAuth()          # JWT token validation
├── requireOwnership()     # Authorization checks
├── generateVideoToken()   # Signed URL generation
└── verifyVideoToken()     # Token validation
```
**Purpose**: Cross-cutting concerns (auth, validation, rate limiting)  
**Depends On**: Layer 0 (env), Layer 1 (Express context)  
**Used By**: Layer 3 (routes)

### **Layer 3: Route Layer** (API Contract)
```javascript
src/routes/ (all telemetry-integrated ✅)
├── auth.js (160 lines)      # POST /register, /login, /logout, GET /me
├── stripe.js (177 lines)    # POST /create-checkout-session, /webhook
├── markdown.js (252 lines)  # GET /public/:filename, /private/:filename
└── video.js (120 lines)     # GET /access/:videoId, /stream/:videoId
```
**Purpose**: Define public API endpoints, orchestrate business logic  
**Depends On**: Layer 2 (middleware), Layer 4 (services)  
**Used By**: External clients (browsers, mobile apps)

### **Layer 4: Service Layer** (Business Logic)
```javascript
src/services/
├── telemetry.js (450 lines)   # OpenTelemetry + Prometheus + Winston
└── websocket.js (255 lines)   # Client Map, message routing, JWT auth
```
**Purpose**: Encapsulate complex operations, maintain WebSocket state  
**Depends On**: Layer 0 (config), Layer 2 (auth middleware)  
**Used By**: Layer 1 (server initialization), Layer 3 (routes)

### **Layer 5: External Services** (Third-Party Dependencies)
```
Stripe API           # Payment processing, subscription management
markdown-it          # Markdown → HTML conversion (+ plugins)
bcrypt               # Password hashing (salted, 10 rounds)
jsonwebtoken         # JWT signing/verification (HS256)
FFmpeg               # Video transcoding (future)
```
**Purpose**: Leverage external platforms for specialized capabilities  
**Depends On**: Layer 0 (API keys, secrets)  
**Used By**: Layer 3 (routes), Layer 4 (services)

### **Layer 6: MCP Server Orchestration** (AI Agent Coordination)
```
.vscode/settings.json (8 servers configured)
├── filesystem, git, github (GITHUB_TOKEN)
├── mongodb, stripe (STRIPE_SECRET_KEY)
├── huggingface (HUGGINGFACE_HUB_TOKEN)
└── azure-quantum, clarity (CLARITY_PROJECT_ID)
```
**Purpose**: Enable AI assistants to leverage external protocols  
**Depends On**: Layer 0 (API tokens), VS Code MCP extension  
**Used By**: Development environment only (NOT production runtime)

### **Layer 7: User Interface** (Presentation)
```
views/ (EJS templates)
├── layout.ejs, index.ejs, markdown.ejs
├── video-player.ejs, 404.ejs, error.ejs

public/ (Static assets)
├── css/ (diablo.css, sanctuary.css, markdown.css, video-player.css)
└── js/ (auth.js, video-player.js, websocket.js)
```
**Purpose**: Render user-facing content, handle client interactions  
**Depends On**: Layer 3 (routes for data), Layer 4 (WebSocket)  
**Used By**: End users (browsers)

---

## 🏛️ Emergent Patterns

1. **Foundation Dominance** — Layer 0 used by 100% of layers. Config loads FIRST.
2. **Middleware as Security Chokepoint** — All sensitive routes flow through Layer 2.
3. **MCP Servers Are Development-Only** — Layer 6 does NOT run in production.
4. **WebSocket Requires Explicit Lifecycle** — Layer 4 maintains `Map<clientId, metadata>`.
5. **Stripe Webhooks Are Edge Cases** — `/stripe/webhook` requires `express.raw()` body parser.

---

## 🛡️ Security Patterns

### **Authentication Flow**
1. User registers → `bcrypt.hash(password, 10)` → creates Stripe customer
2. Login → `bcrypt.compare()` → generates JWT (24h expiry) → sets session cookie
3. Protected routes → `requireAuth()` validates JWT → attaches `req.user`
4. Subscription routes → `requireSubscription()` calls Stripe API

### **Stripe Webhook Security**
```javascript
// CRITICAL: Webhooks MUST use raw body parser
app.use('/stripe/webhook', express.raw({type: 'application/json'}));

// Signature verification prevents spoofed payment events
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
```

### **Content Security**
- **Directory traversal:** Validate filenames don't contain `..` or `/` before `readFile()`
- **Video access:** Signed tokens expire in 1 hour, verified server-side
- **CSP:** Helmet configured with `frameSrc: ["https://js.stripe.com"]`

---

## 📦 Deployment

### **Docker**
```bash
docker-compose up -d    # PM2 cluster mode
                        # Mounts: ./videos:/app/videos, ./content:/app/content
```

### **PM2 (Production)**
```bash
pm2 start ecosystem.config.js  # Cluster mode, max instances, 1GB memory limit
pm2 logs                       # Check logs/pm2-*.log
```

### **Environment Requirements**
- `NODE_ENV=production`
- `SESSION_SECRET` & `JWT_SECRET` (cryptographically random)
- `STRIPE_SECRET_KEY`, `VIDEO_SIGNING_KEY`
- `SLACK_WEBHOOK_URL` (optional, for Alertmanager)

---

## ⚠️ Sacred Invariants (Never Change)

### **Architecture Invariants**
- **ES Modules**: `"type": "module"` — all imports use `.js` extensions
- **4 Core Routes**: `/auth`, `/markdown`, `/stripe`, `/video`
- **Subscription Middleware**: `requireSubscription()` MUST verify Stripe API
- **WebSocket Format**: `{ type: string, ...payload }`
- **Session Security**: `httpOnly: true`, `secure: true` in production
- **Rate Limiting**: 100 req/15min per IP

### **Content Security Invariants**
- **Directory Protection**: `content/public/` vs `content/private/` 
- **Stripe Webhooks**: ALL events MUST verify `stripe-signature` header
- **JWT Expiration**: 24-hour limit

### **MCP Integration Invariants**
- **8 MCP Servers**: filesystem, git, github, mongodb, stripe, huggingface, azure-quantum, clarity
- **npx -y Pattern**: All use `npx -y @modelcontextprotocol/server-{name}`

---

## 🚧 Known Failure Modes

**Dependency Vulnerabilities**:
- Missing packages cause startup failure
- `npm audit` drift over time
- Old `bcrypt` versions have timing attacks

**Authentication Bypass**:
- Forgotten `requireSubscription()` middleware leaks premium content
- Weak JWT secret allows token forgery
- Missing `secure: true` exposes session cookies on HTTP

**Payment Fraud**:
- Stripe webhook without signature verification
- Client-side subscription status trust
- Wrong body parser breaks webhook signatures

**Content Security**:
- Directory traversal: `GET /markdown/private/../../../etc/passwd`
- Missing video token verification
- HTML in markdown → XSS risk

**WebSocket Abuse**:
- No auth allows anonymous flooding
- Unbounded Client Map → memory leak
- Missing rate limiting → DDoS amplification

**Environment Variables**:
- Missing `.env` → undefined behavior
- `NODE_ENV` not set → exposes debug errors
- Silent failures with missing `STRIPE_SECRET_KEY`

**Mitigation**:
- CI/CD: Run `npm test`, `npm run lint`, `npm audit`
- Health checks: `GET /health` endpoint
- Logging: Morgan middleware for forensics
