# Development Workflow & Windows/PowerShell Guide

## 🛠️ VS Code Task-Based Development

Instead of using npm commands directly, use **VS Code tasks** (`Ctrl+Shift+P` → "Run Task"):

```
🌸 Install Dependencies       # npm install
💎 Run Tests (100% Coverage)  # Jest with 80% threshold (NODE_OPTIONS='--experimental-vm-modules')
💎 Lint Code                  # ESLint src/ --ext .js
💎 Format Code                # Prettier on src/, public/, views/
🌀 Build Project              # npm run lint && npm run test
✨ Start Control Tower (Dev)  # nodemon src/server.js (watches .js, .ejs)
🎭 Full Development Cycle     # Sequential: install → lint → test → build
```

## 📋 npm Scripts (All Functional)

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

## 🎨 Emoji-Driven Git Commits

```bash
🌸  Package management (npm install, dependency updates)
👑  Architecture decisions (refactors, design changes)
💎  Quality metrics (tests, linting, coverage)
🦋  Transformations (migrations, docs)
✨  Server operations (deployment, MCP)
🎭  Development lifecycle (CI/CD)

# Examples:
git commit -m "🌸 Add missing bcrypt dependency to package.json"
git commit -m "💎 Add Jest tests for WebSocket service"
git commit -m "👑 Refactor authentication middleware architecture"
```

## 🪟 Windows/PowerShell Specific Notes

### **PowerShell Execution Policy Fix**
If you see "running scripts is disabled":

```powershell
# Option 1: Set for current user (recommended)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Option 2: Bypass for single session
powershell -ExecutionPolicy Bypass -File script.ps1

# Option 3: Use VS Code tasks instead (they bypass this issue)
```

### **Path Handling**
- **Windows paths**: `F:\bambisleep-church` (native)
- **WSL paths**: `/mnt/f/bambisleep-church` (for MCP servers)
- **Node.js code**: Use forward slashes (works on both Windows/Linux)

### **WSL Integration**
```powershell
# Open project in WSL from Windows
wsl cd /mnt/f/bambisleep-church

# Run npm commands via WSL (if PowerShell has issues)
wsl npm install
wsl npm test

# VS Code task: "🐧 Open in WSL" does this automatically
```

### **Common Windows Issues**

| Issue | Solution |
|-------|----------|
| `npm` not recognized | Add Node.js to PATH or restart VS Code |
| `ENOENT` errors | Use absolute paths or `path.join()` instead of string concatenation |
| Line endings | `git config core.autocrlf true` |
| Permission denied | Run VS Code as administrator (for system operations) |

## 🧪 Testing Philosophy

**"100% test coverage or suffer in callback hell eternal"** — Project mantra

```json
"jest": {
  "coverageThreshold": {
    "global": {"statements": 80, "branches": 70, "functions": 80, "lines": 80}
  }
}
```

Run with: `NODE_OPTIONS='--experimental-vm-modules' jest --coverage`

## 📖 Key Project Files

```
src/server.js              # Express setup (247 lines), telemetry middleware
src/services/telemetry.js  # OpenTelemetry SDK + Prometheus + Winston (450 lines)
src/middleware/auth.js     # requireSubscription, requireAuth, video token signing
src/routes/*.js            # auth, stripe, markdown, video (all telemetry-integrated ✅)
src/services/websocket.js  # Client Map, message routing, JWT auth
views/*.ejs                # EJS templates (index, error, 404, markdown, video-player)
.vscode/settings.json      # 8 MCP servers, WSL config
docker-compose.yml         # Production Docker stack
ecosystem.config.js        # PM2 process manager config
TELEMETRY.md               # Observability architecture (497 lines)
SECURITY.md                # Attack surface management (350+ lines)
BUILD.md, TODO.md          # Project roadmap and task tracking
```

## ⚠️ Common Pitfalls

1. **Forgetting `.js` extensions** → ES module imports fail silently
2. **Stripe webhook without raw body** → Signature verification fails
3. **Missing environment variables** → Copy `.env.example` to `.env` before starting
4. **Not setting `secure: true` in production** → Session cookies interceptable on HTTP
5. **Skipping telemetry middleware** → Metrics won't be collected for new routes

## 🚧 Known Gaps

1. ~~**Missing source files:**~~ `src/mcp/orchestrator.js`, `src/utils/logger.js` (coverage reports exist)
2. ~~**Empty directory:**~~ `src/ui/` removed (future MCP dashboard)
3. ~~**In-memory user store:**~~ `src/routes/auth.js` uses `Map()` (database integration pending)
4. **No database yet:** MongoDB configured in MCP but not used by application
5. ~~**TODO comments:**~~ All critical TODOs resolved

## 📝 Organization Requirements

- **Always** use "BambiSleep™" trademark symbol in docs
- **Repository**: `BambiSleepChat/bambisleep-church`
- **License**: MIT with proper attribution
