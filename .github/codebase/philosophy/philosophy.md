# The Six Genesis Questions (Law, Lore & Logic Foundation)

*Every living system must answer these before it can serve*

---

## 1. What does this do? (Law - Objective Function)

**BambiSleep™ Church** is a **production Express.js web application** that serves as an **MCP Control Tower** and subscription-gated content delivery platform. It provides:

- **Authentication System**: User registration, login with bcrypt password hashing, JWT token generation
- **Stripe Payment Integration**: Subscription checkout, webhook handling, payment intent creation
- **Content Delivery**: Public/private markdown rendering with `markdown-it`, subscription-based access control
- **Video Streaming**: FFmpeg-based video delivery with signed URL tokens (1-hour expiration)
- **Real-Time WebSocket**: Bidirectional communication for chat, avatar actions, room subscriptions
- **MCP Server Orchestration**: 8 configured Model Context Protocol servers (filesystem, git, github, mongodb, stripe, huggingface, azure-quantum, clarity)
- **Enterprise Observability**: OpenTelemetry distributed tracing, Prometheus metrics, DORA metrics, security monitoring

**Technical Stack**: Node.js 20+ (ES Modules), Express 4.19, WebSocket (ws), EJS templates, Docker + PM2 deployment, port 3000, Prometheus port 9464

---

## 2. Why does it exist? (Lore - Strategic Decision)

### **The Ache**

The BambiSleep community needed a centralized "sanctuary" platform that could:

1. Gate premium content behind Stripe subscriptions (video library, exclusive markdown docs)
2. Provide real-time interactions (chat, avatar presence) without third-party services
3. Serve as an **MCP Control Tower** - a development environment where AI agents can coordinate across 8 different protocol servers
4. Demonstrate production-ready Express.js patterns (security middleware, session management, WebSocket architecture)

### **The Solution**

Build a **dual-purpose platform**:

- **User-Facing**: Subscription-based content sanctuary with Diablo 1 Hellfire aesthetic
- **Developer-Facing**: MCP integration playground where AI assistants (like GitHub Copilot) can leverage filesystem, git, database, payment, and ML model operations

### **Why Express.js?**

Battle-tested, well-documented, extensive middleware ecosystem, easy WebSocket integration via `ws` library, straightforward deployment to VPS/cloud

### **Why EJS over React?**

Server-side rendering reduces client JavaScript bundle, simpler auth flow (session cookies), better SEO for public content, faster initial page load

### **Why This Architecture?**

Separation of concerns (routes → middleware → services), easy to test individual components, clear dependency lattice, can extract pieces into microservices later

---

## 3. What must never change? (Law - Sacred Invariants)

See [`.github/codebase/architecture.md`](.github/codebase/architecture.md) for complete list.

**Critical Invariants**:

- **ES Modules**: `"type": "module"` — all imports use `.js` extensions
- **4 Core Routes**: `/auth`, `/markdown`, `/stripe`, `/video`
- **Subscription Middleware**: `requireSubscription()` MUST verify Stripe API
- **WebSocket Format**: `{ type: string, ...payload }`
- **Stripe Webhook Signatures**: ALL events MUST verify `stripe-signature` header
- **8 MCP Servers**: filesystem, git, github, mongodb, stripe, huggingface, azure-quantum, clarity

---

## 4. What did we learn building it? (Lore - Emergent Patterns)

### **Key Insights from Development**

1. **Missing Dependencies Are Silent Killers** — Code imports `stripe`, `jsonwebtoken`, `markdown-it` but these aren't in `package.json`. The server won't start until you run: `npm install stripe jsonwebtoken markdown-it markdown-it-attrs markdown-it-anchor markdown-it-toc-done-right`. This was discovered when the first deployment failed.

2. **WebSocket Lifecycle Requires Explicit State** — Simply using `ws` library isn't enough. We learned to maintain a `Map<clientId, clientMetadata>` with `{ ws, authenticated, userId, connectedAt }`. Without this, you can't route messages to specific clients or implement presence detection.

3. **Stripe Webhooks Need Raw Body** — The `/stripe/webhook` endpoint MUST use `express.raw({ type: 'application/json' })` instead of `express.json()`. Signature verification fails if the body is parsed as JSON first. This took 3 hours to debug.

4. **Session Cookies vs JWT: Know When to Use Each** — Browser routes use `req.session` (Express session cookies), API endpoints use `Authorization: Bearer <jwt>` (JWT tokens). Mobile apps need JWT, web pages need sessions. Mixing them causes auth bugs.

5. **Content Security Policy Blocks Everything By Default** — Helmet CSP requires explicit `frameSrc: ["https://js.stripe.com"]` to embed Stripe Checkout. Without this, payments silently fail in production. Development mode doesn't show this because localhost bypasses CSP.

6. **MCP Servers Are Development Tools, Not Runtime Dependencies** — The 8 MCP servers (configured in `.vscode/settings.json`) are for AI assistant features in VS Code. They DON'T run on the production server. This was confusing at first - "why can't my deployed app use MCP?"

7. **Empty Directories Signal Intent** — The `src/ui/` folder was empty. This wasn't a mistake - it was a placeholder for the future MCP dashboard UI. Documenting "what's missing" is as important as documenting "what exists". (Now removed)

8. **Dual-Channel Documentation Emerged Naturally** — We started with just code comments. Then added `BUILD.md` (how to build), `TODO.md` (what's missing), `CHANGELOG.md` (what changed), `docs/` (why decisions were made). Each file serves a different cognitive purpose - Law (technical truth) and Lore (intentional context) naturally separated.

9. **npm Scripts That Actually Work Are Rare** — Many projects have placeholder scripts that `echo 'not implemented'`. This project has 27 FUNCTIONAL scripts (`npm run dev`, `npm test`, `npm run docker:up`, etc.). This wasn't accidental - it was a deliberate commitment to "if it's in package.json, it works."

---

## 5. How did it feel to create? (Lore - Heart Imprint)

### **Developer Reflections**

1. **The First WebSocket Connection** — When `ws-connect` button finally worked and messages flowed bidirectionally, it felt like digital telepathy. Real-time web feels magical compared to request-response HTTP.

2. **Stripe Integration Anxiety** — Implementing payments always feels high-stakes. Every webhook event is money changing hands. The moment `customer.subscription.created` fired correctly in production was relief + terror.

3. **Aesthetic Matters** — The Diablo 1 Hellfire gothic theme wasn't just decoration. Dark red gradients, stone textures, serif fonts - it FELT like entering a sanctuary. UI is ritual space.

4. **MCP Configuration as Discovery** — Adding 8 MCP servers to `.vscode/settings.json` wasn't just configuration - it was exploring what AI agents could DO. Each server opened new capabilities: github for code search, mongodb for persistence, stripe for payments, huggingface for ML models.

5. **Documentation Debt is Real** — Writing this Rosetta Stone (pulling from CodeCraft patterns) makes the implicit explicit. So much tribal knowledge lived only in my head until now. Future developers (or AI agents) deserve a map.

6. **The Weight of Production** — Knowing this server handles real payments, stores user credentials, gates content - every security decision matters. `helmet()`, `rateLimit()`, `bcrypt.hash()` - these aren't optional.

---

## 6. How can this be broken? (Logic - Adversarial Test)

See [`.github/codebase/architecture.md`](.github/codebase/architecture.md) for complete failure mode analysis.

**Critical Failure Modes**:

- **Dependency Vulnerabilities**: Missing packages, drift over time, outdated bcrypt
- **Authentication Bypass**: Forgotten middleware, weak JWT secret, insecure cookies
- **Payment Fraud**: Unverified webhooks, client-side trust, wrong body parser
- **Content Security**: Directory traversal, missing token verification, XSS via markdown
- **WebSocket Abuse**: No auth, memory leaks, DDoS amplification
- **Environment Variables**: Missing `.env`, wrong `NODE_ENV`, silent failures

**Mitigation**: CI/CD (`npm test`, `npm run lint`, `npm audit`), health checks (`GET /health`), logging (Morgan middleware)
