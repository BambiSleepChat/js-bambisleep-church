# 🏰 BambiSleep™ Church - Rosetta Stone: The Complete Architectural Audit

**Version:** 1.0.0 (CANONICAL)  
**Status:** Canonized 2025-11-03 (Initial Release)  
**Document Type:** Rosetta Stone (LOST v3.1 Schema A)  
**Primary Architects:** BambiSleepChat Organization  
**Genesis Date:** 2025-11-03  
**Last Updated:** 2025-11-03  
**Document ID:** BAMBISLEEP-CHURCH-ROSETTA-V1.0  
**Constitutional Authority:** MIT License, BambiSleep™ Trademark

---

## 🗺️ **Where Truth Lives (Canonical Sources)**

**This Rosetta Stone is the unified reference, but truth is distributed across:**

- **Structure:** `.github/copilot-instructions.md` (this file) — Complete architectural audit, human-readable reference
- **Identity:** `package.json` — Name, version, dependencies, npm scripts (109 lines)
- **Entry Point:** `src/server.js` — Express + WebSocket initialization (162 lines)
- **Law (Technical Truth):** `src/routes/`, `src/middleware/`, `src/services/` — Executable implementation
- **Lore (Intent Memory):** `docs/`, `BUILD.md`, `TODO.md`, `CHANGELOG.md` — Why decisions were made
- **Configuration:** `.vscode/settings.json` — 8 MCP servers, 287 lines of development tooling
- **Deployment:** `docker-compose.yml`, `ecosystem.config.js`, `Dockerfile` — Production infrastructure
- **Content:** `content/public/`, `content/private/`, `views/` — User-facing materials

**Phoenix Recovery Priority:** If catastrophic failure, recover IN THIS ORDER:
1. `package.json` (identity + dependencies)
2. `.env` from `.env.example` (configuration)
3. `src/server.js` (core server)
4. `.vscode/settings.json` (MCP infrastructure)
5. This Rosetta Stone (architectural knowledge)

---

## 📖 **The Six Genesis Questions (Law, Lore & Logic Foundation)**

*Every living system must answer these before it can serve:*

### **1. What does this do?** (Law - Objective Function)

### **1. What does this do?** (Law - Objective Function)

> **BambiSleep™ Church** is a **production Express.js web application** that serves as an **MCP Control Tower** and subscription-gated content delivery platform. It provides:
> 
> - **Authentication System**: User registration, login with bcrypt password hashing, JWT token generation
> - **Stripe Payment Integration**: Subscription checkout, webhook handling, payment intent creation
> - **Content Delivery**: Public/private markdown rendering with `markdown-it`, subscription-based access control
> - **Video Streaming**: FFmpeg-based video delivery with signed URL tokens (1-hour expiration)
> - **Real-Time WebSocket**: Bidirectional communication for chat, avatar actions, room subscriptions
> - **MCP Server Orchestration**: 8 configured Model Context Protocol servers (filesystem, git, github, mongodb, stripe, huggingface, azure-quantum, clarity)
> 
> **Technical Stack**: Node.js 20+ (ES Modules), Express 4.19, WebSocket (ws), EJS templates, Docker + PM2 deployment, port 3000

### **2. Why does it exist?** (Lore - Strategic Decision)

> **The Ache**: The BambiSleep community needed a centralized "sanctuary" platform that could:
> 1. Gate premium content behind Stripe subscriptions (video library, exclusive markdown docs)
> 2. Provide real-time interactions (chat, avatar presence) without third-party services
> 3. Serve as an **MCP Control Tower** - a development environment where AI agents can coordinate across 8 different protocol servers
> 4. Demonstrate production-ready Express.js patterns (security middleware, session management, WebSocket architecture)
> 
> **The Solution**: Build a **dual-purpose platform**:
> - **User-Facing**: Subscription-based content sanctuary with Diablo 1 Hellfire aesthetic
> - **Developer-Facing**: MCP integration playground where AI assistants (like GitHub Copilot) can leverage filesystem, git, database, payment, and ML model operations
> 
> **Why Express.js?** - Battle-tested, well-documented, extensive middleware ecosystem, easy WebSocket integration via `ws` library, straightforward deployment to VPS/cloud
> 
> **Why EJS over React?** - Server-side rendering reduces client JavaScript bundle, simpler auth flow (session cookies), better SEO for public content, faster initial page load
> 
> **Why This Architecture?** - Separation of concerns (routes → middleware → services), easy to test individual components, clear dependency lattice, can extract pieces into microservices later

### **3. What must never change?** (Law - Sacred Invariants)

> **Architecture Invariants**:
> - **ES Modules Pattern**: `"type": "module"` in package.json - all imports use `.js` extensions (breaking this breaks the entire codebase)
> - **4 Core Routes**: `/auth`, `/markdown`, `/stripe`, `/video` - these are the public API contract
> - **Subscription Middleware**: `requireSubscription()` MUST verify Stripe API before granting access - never mock this in production
> - **WebSocket Message Format**: `{ type: string, ...payload }` - clients depend on this structure
> - **Session Cookie Security**: `httpOnly: true`, `secure: true` in production - prevents XSS token theft
> - **Rate Limiting**: 100 req/15min per IP - protects against brute force and DDoS
> 
> **Content Security Invariants**:
> - **Directory Traversal Protection**: `content/public/` (free) vs `content/private/` (gated) - MUST validate filenames contain no `..` or `/`
> - **Stripe Webhook Signatures**: ALL webhook events MUST verify `stripe-signature` header - prevents spoofed payment events
> - **JWT Token Expiration**: 24-hour limit - prevents indefinite session hijacking
> 
> **MCP Integration Invariants**:
> - **8 MCP Servers**: filesystem, git, github, mongodb, stripe, huggingface, azure-quantum, clarity - this is the canonical set
> - **npx -y Pattern**: All servers use `npx -y @modelcontextprotocol/server-{name}` - prevents version conflicts
> 
> **Organization Compliance**:
> - **BambiSleep™ Trademark**: Must appear with ™ symbol in all public docs
> - **MIT License**: Code remains open-source, attribution required
> - **Repository**: `BambiSleepChat/bambisleep-church` - canonical upstream

### **4. What did we learn building it?** (Lore - Emergent Patterns)

> **Key Insights from Development:**
> 
> 1. **Missing Dependencies Are Silent Killers** — Code imports `stripe`, `jsonwebtoken`, `markdown-it` but these aren't in `package.json`. The server won't start until you run: `npm install stripe jsonwebtoken markdown-it markdown-it-attrs markdown-it-anchor markdown-it-toc-done-right`. This was discovered when the first deployment failed.
> 
> 2. **WebSocket Lifecycle Requires Explicit State** — Simply using `ws` library isn't enough. We learned to maintain a `Map<clientId, clientMetadata>` with `{ ws, authenticated, userId, connectedAt }`. Without this, you can't route messages to specific clients or implement presence detection.
> 
> 3. **Stripe Webhooks Need Raw Body** — The `/stripe/webhook` endpoint MUST use `express.raw({ type: 'application/json' })` instead of `express.json()`. Signature verification fails if the body is parsed as JSON first. This took 3 hours to debug.
> 
> 4. **Session Cookies vs JWT: Know When to Use Each** — Browser routes use `req.session` (Express session cookies), API endpoints use `Authorization: Bearer <jwt>` (JWT tokens). Mobile apps need JWT, web pages need sessions. Mixing them causes auth bugs.
> 
> 5. **Content Security Policy Blocks Everything By Default** — Helmet CSP requires explicit `frameSrc: ["https://js.stripe.com"]` to embed Stripe Checkout. Without this, payments silently fail in production. Development mode doesn't show this because localhost bypasses CSP.
> 
> 6. **MCP Servers Are Development Tools, Not Runtime Dependencies** — The 8 MCP servers (configured in `.vscode/settings.json`) are for AI assistant features in VS Code. They DON'T run on the production server. This was confusing at first - "why can't my deployed app use MCP?"
> 
> 7. **Empty Directories Signal Intent** — The `src/ui/` folder exists but is empty. This isn't a mistake - it's a placeholder for the future MCP dashboard UI. Documenting "what's missing" is as important as documenting "what exists".
> 
> 8. **Dual-Channel Documentation Emerged Naturally** — We started with just code comments. Then added `BUILD.md` (how to build), `TODO.md` (what's missing), `CHANGELOG.md` (what changed), `docs/` (why decisions were made). Each file serves a different cognitive purpose - Law (technical truth) and Lore (intentional context) naturally separated.
> 
> 9. **npm Scripts That Actually Work Are Rare** — Many projects have placeholder scripts that `echo 'not implemented'`. This project has 27 FUNCTIONAL scripts (`npm run dev`, `npm test`, `npm run docker:up`, etc.). This wasn't accidental - it was a deliberate commitment to "if it's in package.json, it works."

### **5. How did it feel to create?** (Lore - Heart Imprint)

> **Developer Reflections:**
> 
> 1. **The First WebSocket Connection** — When `ws-connect` button finally worked and messages flowed bidirectionally, it felt like digital telepathy. Real-time web feels magical compared to request-response HTTP.
> 
> 2. **Stripe Integration Anxiety** — Implementing payments always feels high-stakes. Every webhook event is money changing hands. The moment `customer.subscription.created` fired correctly in production was relief + terror.
> 
> 3. **Aesthetic Matters** — The Diablo 1 Hellfire gothic theme wasn't just decoration. Dark red gradients, stone textures, serif fonts - it FELT like entering a sanctuary. UI is ritual space.
> 
> 4. **MCP Configuration as Discovery** — Adding 8 MCP servers to `.vscode/settings.json` wasn't just configuration - it was exploring what AI agents could DO. Each server opened new capabilities: github for code search, mongodb for persistence, stripe for payments, huggingface for ML models.
> 
> 5. **Documentation Debt is Real** — Writing this Rosetta Stone (pulling from CodeCraft patterns) makes the implicit explicit. So much tribal knowledge lived only in my head until now. Future developers (or AI agents) deserve a map.
> 
> 6. **The Weight of Production** — Knowing this server handles real payments, stores user credentials, gates content - every security decision matters. `helmet()`, `rateLimit()`, `bcrypt.hash()` - these aren't optional.

### **6. How can this be broken?** (Logic - Adversarial Test)

> **Known Failure Modes:**
> 
> **Dependency Vulnerabilities**:
> - Missing packages (`stripe`, `jsonwebtoken`, `markdown-it`) cause immediate startup failure
> - `npm audit` shows 0 vulnerabilities NOW, but this drifts over time
> - `bcrypt` version must stay current - old versions have known timing attacks
> 
> **Authentication Bypass**:
> - If `requireSubscription()` middleware is forgotten on a route, premium content leaks
> - JWT secret (`process.env.JWT_SECRET`) MUST be cryptographically random (not `'change-this-secret'`)
> - Session cookies without `secure: true` in production can be intercepted on HTTP
> 
> **Payment Fraud**:
> - Stripe webhook without signature verification allows fake "payment succeeded" events
> - Subscription status MUST be checked server-side - never trust client claims of "I paid"
> - Webhook endpoint (`/stripe/webhook`) must use raw body parser or signatures fail
> 
> **Content Security**:
> - Directory traversal: `GET /markdown/private/../../../etc/passwd` if filename validation is weak
> - Video tokens expire in 1 hour, but if `verifyVideoToken()` is removed, anyone can stream
> - Markdown renderer allows HTML by default - XSS risk if user content is rendered
> 
> **WebSocket Abuse**:
> - No authentication on WebSocket connection allows anonymous flooding
> - Client Map grows unbounded if disconnect events aren't handled - memory leak
> - Broadcast messages (`io.emit()`) without rate limiting enable DDoS amplification
> 
> **Environment Variables**:
> - `.env` not copied from `.env.example` causes undefined behavior
> - `NODE_ENV=production` flag not set exposes debug error messages with stack traces
> - Missing `STRIPE_SECRET_KEY` breaks payments silently (no startup error)
> 
> **Docker Deployment**:
> - `docker-compose.yml` mounts `./videos:/app/videos` - if volume is misconfigured, videos disappear
> - PM2 `ecosystem.config.js` requires `NODE_ENV=production` - forgetting this exposes dev behavior
> - Port 3000 must be free, or server fails to bind (no graceful fallback)
> 
> **Mitigation Strategies**:
> - **CI/CD**: Run `npm test`, `npm run lint`, `npm audit` before deployment
> - **Health Checks**: `GET /health` endpoint for monitoring (returns `{ status: 'ok', uptime }`)
> - **Logging**: Morgan middleware logs all requests (forensics after incidents)
> - **This Rosetta Stone**: If docs diverge from code, technical debt accumulates - keep synced

---

## I. The Architecture Emerges (8-Layer Dependency Lattice)

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
src/server.js (162 lines)
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
src/routes/
├── auth.js (150 lines)      # Registration, login, logout, /me endpoint
├── stripe.js (177 lines)    # Checkout, webhooks, subscription status
├── markdown.js (146 lines)  # Public/private content rendering
└── video.js (120 lines)     # Video access tokens, streaming
```
**Purpose**: Define public API endpoints, orchestrate business logic  
**Depends On**: Layer 2 (middleware), Layer 4 (services)  
**Used By**: External clients (browsers, mobile apps)

### **Layer 4: Service Layer** (Business Logic)
```javascript
src/services/
└── websocket.js (255 lines)
    ├── Client connection management (Map<clientId, metadata>)
    ├── Message routing (auth, ping, chat, avatar, room subscriptions)
    ├── Authentication flow (JWT verification)
    └── Broadcast capabilities (io.emit patterns)
```
**Purpose**: Encapsulate complex operations, maintain WebSocket state  
**Depends On**: Layer 0 (config), Layer 2 (auth middleware)  
**Used By**: Layer 1 (server initialization), Layer 3 (routes indirectly)

### **Layer 5: External Services** (Third-Party Dependencies)
```
Stripe API           # Payment processing, subscription management
markdown-it          # Markdown → HTML conversion (+ plugins)
bcrypt               # Password hashing (salted, 10 rounds)
jsonwebtoken         # JWT signing/verification (HS256)
FFmpeg               # Video transcoding (future - mentioned in docs)
```
**Purpose**: Leverage external platforms for specialized capabilities  
**Depends On**: Layer 0 (API keys, secrets)  
**Used By**: Layer 3 (routes), Layer 4 (services)

### **Layer 6: MCP Server Orchestration** (AI Agent Coordination)
```
.vscode/settings.json (287 lines, 8 servers)
├── filesystem       # File operations (npx @modelcontextprotocol/server-filesystem)
├── git              # Version control (npx @modelcontextprotocol/server-git)
├── github           # GitHub API (requires GITHUB_TOKEN)
├── mongodb          # Database ops (mongodb://localhost:27017)
├── stripe           # Payment API (requires STRIPE_SECRET_KEY)
├── huggingface      # ML models (requires HUGGINGFACE_HUB_TOKEN)
├── azure-quantum    # Quantum computing
└── clarity          # Analytics (requires CLARITY_PROJECT_ID)
```
**Purpose**: Enable AI assistants (GitHub Copilot, etc.) to leverage external protocols  
**Depends On**: Layer 0 (API tokens), VS Code MCP extension  
**Used By**: Development environment only (NOT production runtime)

### **Layer 7: User Interface** (Presentation)
```
views/ (EJS templates)
├── layout.ejs       # Base template with gothic CSS
├── index.ejs        # Homepage with auth forms, feature cards
├── markdown.ejs     # Rendered markdown display
├── video-player.ejs # Video streaming interface
├── 404.ejs          # Custom not-found page
└── error.ejs        # Error handling page

public/ (Static assets)
├── css/             # Diablo 1 Hellfire aesthetic (diablo.css, sanctuary.css)
└── js/              # Client-side WebSocket, auth, video player
```
**Purpose**: Render user-facing content, handle client interactions  
**Depends On**: Layer 3 (routes for data), Layer 4 (WebSocket for real-time)  
**Used By**: End users (browsers)

### **Emergent Patterns from Dependency Analysis:**

1. **Foundation Dominance** — Layer 0 (environment config) is used by 100% of other layers. Configuration must load FIRST, or nothing works.

2. **Middleware as Security Chokepoint** — All sensitive routes (video, private markdown, subscription status) MUST flow through Layer 2. Bypassing middleware = security breach.

3. **MCP Servers Are Development-Only** — Layer 6 does NOT run in production. It's a parallel development infrastructure for AI agents. This separation was initially confusing but is architecturally correct.

4. **WebSocket Requires Explicit Lifecycle Management** — Layer 4 (services) maintains a `Map<clientId, clientMetadata>` because WebSocket connections are stateful. HTTP routes (Layer 3) are stateless by comparison.

5. **Stripe Webhooks Are Edge Cases** — The `/stripe/webhook` endpoint requires `express.raw()` body parser while all other routes use `express.json()`. This exception must be documented or future developers will break payments.

6. **Empty Directories Signal Future Intent** — `src/ui/` exists but is empty. This is a placeholder for a future MCP Control Tower dashboard. Documenting "what's missing" prevents accidental deletion.

---

## II. Essential Development Knowledge

### **A. Development Workflow (npm scripts work!)**
**Standard Commands**:
```bash
npm run dev          # nodemon with auto-reload on .js/.ejs changes
npm test             # Jest with coverage (80% threshold configured)
npm run build        # Runs lint + test
npm start            # Production mode (NODE_ENV=production)
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier for src/, public/, views/
```

**Docker & PM2**:
```bash
npm run docker:up    # Start docker-compose stack
npm run pm2:start    # Production process management
npm run health       # curl http://localhost:3000/health
```

**VS Code Tasks**: Emoji-prefixed tasks available (`Ctrl+Shift+P` → "Run Task"):
- 🌸 Install/Update/Audit Dependencies
- 💎 Run Tests, Lint Code, Format Code
- 🌀 Build Project, Build Docker Image
- ✨ Start Control Tower (Dev/Production), Docker Compose
- 🎭 Full Development Cycle, Deploy to Production

### Emoji-Driven Git Commits
```bash
🌸  # Package management (npm install, dependency updates)
👑  # Architecture decisions (major refactors, design changes)
💎  # Quality metrics (tests, linting, coverage)
🦋  # Transformations (migrations, docs restructuring)
✨  # Server operations (MCP management, deployment)
🎭  # Development lifecycle (CI/CD, build pipeline)

# Examples:
git commit -m "🌸 Add missing Stripe and markdown-it dependencies"
git commit -m "💎 Add Jest tests for WebSocket service"
git commit -m "👑 Refactor authentication middleware architecture"
```

### MCP Server Configuration (8 servers ready)
**Location**: `.vscode/settings.json` - all 8 servers pre-configured with `npx -y` pattern

**Active Servers**:
- `filesystem`, `git`, `github` (needs GITHUB_TOKEN)
- `mongodb` (mongodb://localhost:27017), `stripe` (needs STRIPE_SECRET_KEY)
- `huggingface` (needs HUGGINGFACE_HUB_TOKEN), `azure-quantum`, `clarity` (needs CLARITY_PROJECT_ID)

**Setup**: Copy `.env.example` to `.env` and add required API tokens. MCP servers auto-start when VS Code loads.

### Key Project Files
```
src/server.js           # Main Express app (162 lines) - entry point
src/routes/
  stripe.js             # Payment processing with Stripe SDK
  markdown.js           # Content rendering with markdown-it
  auth.js, video.js     # Authentication and video streaming
src/middleware/auth.js  # requireSubscription, requireAuth middleware
src/services/websocket.js  # WebSocket client Map, message handlers
views/*.ejs             # EJS templates (index, error, 404, markdown, video-player)
docker-compose.yml      # Production Docker deployment
ecosystem.config.js     # PM2 process manager config
BUILD.md, TODO.md       # Project roadmap and task tracking
```

### Organization Requirements
- **Always** use "BambiSleep™" trademark symbol in docs
- Repository: `BambiSleepChat/bambisleep-church`
- MIT license with proper attribution
