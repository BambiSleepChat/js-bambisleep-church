# BambiSleep™ Church Development BUILD Plan
*🌸 MCP Control Tower & Unity Avatar Development Workflow 🌸*

## 🎯 Project Architecture Overview

This is a **dual-platform development environment** requiring specialized build workflows:

1. **MCP Control Tower** (Node.js) - AI tooling integration platform
2. **Unity CatGirl Avatar System** (C#) - XR avatar with enterprise features

**Critical Understanding**: This project uses emoji-driven development with 100% test coverage enforcement and requires VS Code task-based workflows instead of direct npm commands.

---

## 🐧 Phase 0: WSL Remote Development Setup (NEW - HIGH PRIORITY)

### 0.1 Install & Configure WSL 2

**Purpose**: Enable seamless cross-platform development between Windows and Linux environments following Microsoft best practices.

**Reference**: [Microsoft Learn - WSL + VS Code Tutorial](https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-vscode)

```powershell
# PowerShell (as Administrator)
wsl --install
wsl --set-default-version 2

# Verify installation
wsl --list --verbose
```

### 0.2 Install VS Code Remote Development Extension Pack

**Required Extensions**:
- `ms-vscode-remote.vscode-remote-extensionpack` (includes WSL, SSH, Containers)
- `ms-vscode-remote.remote-wsl` (WSL integration)

**Installation**:
1. Open VS Code on Windows
2. Install Remote Development extension pack from Marketplace
3. Restart VS Code

### 0.3 Open Project in WSL Mode

```powershell
# Method A: From Windows
cd f:\bambisleep-church
code .
# Then: Ctrl+Shift+P → "WSL: Reopen Folder in WSL"

# Method B: From WSL
wsl
cd /mnt/f/bambisleep-church
code .
```

**Verification**:
- Check bottom-left corner of VS Code for "WSL: Ubuntu" indicator
- All extensions configured in `.vscode/extensions.json` will auto-install in WSL

### 0.4 Configure Development Environment in WSL

```bash
# Inside WSL terminal in VS Code
# 1. Update system
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y wget ca-certificates curl git build-essential

# 2. Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Verify versions
node --version  # Should be >=20.0.0
npm --version   # Should be >=10.0.0

# 4. Install project dependencies
npm install

# 5. Configure environment
cp .env.example .env
# Edit .env with your API tokens
```

### 0.5 Verify MCP Server Configuration

All 8 MCP servers are pre-configured in `.vscode/settings.json`:

✅ **filesystem** - File operations  
✅ **git** - Git version control  
✅ **github** - GitHub integration (requires `GITHUB_TOKEN` env var)  
✅ **mongodb** - Database operations  
✅ **stripe** - Payment processing (requires `STRIPE_SECRET_KEY` env var)  
✅ **huggingface** - AI/ML models (requires `HUGGINGFACE_HUB_TOKEN` env var)  
✅ **azure-quantum** - Quantum computing  
✅ **clarity** - Analytics (requires `CLARITY_PROJECT_ID` env var)  

**Configuration Check**:
```bash
# Verify npx is available
which npx
npx --version

# Test MCP server availability (example)
npx -y @modelcontextprotocol/server-filesystem --help
```

### 0.6 Run Initial Tests

```bash
# Inside WSL terminal
npm test           # Run tests with coverage
npm run lint       # Check code quality
npm run dev        # Start development server
```

**Expected Results**:
- Tests pass (current coverage: ~79%)
- ESLint runs without errors
- Server starts at `http://localhost:3000`

**Complete Documentation**: See `docs/WSL_SETUP_GUIDE.md` for detailed troubleshooting and performance optimization.

---

## 🚀 Phase 1: Foundation Setup (Infrastructure)

### 1.1 Environment Prerequisites
```bash
# System Requirements
node --version    # Must be >=20.0.0
npm --version     # Must be >=10.0.0
git --version     # Any recent version
code --version    # VS Code with MCP extension support

# Verify VS Code Extensions
# - GitHub Copilot (configured for BambiSleepChat org)
# - MCP Extension (for Model Context Protocol integration)
# - ESLint + Prettier (zero-config approach)
# - Code Spell Checker
```

### 1.2 MCP Server Configuration (Priority #1)
**Current State**: 3/8 servers active (filesystem, git, github)  
**Target**: 8/8 servers operational for full AI tooling integration

```bash
# Phase 1A: Add Missing MCP Servers to .vscode/settings.json
# MongoDB Server (requires connection string)
"mongodb": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-mongodb", "--connection-string", "mongodb://localhost:27017"]
}

# Stripe Server (requires STRIPE_SECRET_KEY env var)
"stripe": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-stripe"]
}

# HuggingFace Server (requires HUGGINGFACE_HUB_TOKEN env var)
"huggingface": {
  "command": "npx", 
  "args": ["-y", "@modelcontextprotocol/server-huggingface"]
}

# Azure Quantum Server (requires workspace config)
"azure-quantum": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-azure-quantum"]
}

# Microsoft Clarity Server (requires project ID)
"clarity": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-microsoft-clarity"]
}
```

### 1.3 Environment Variables Setup
Create `.env` file with required API keys:
```bash
# GitHub Integration (already working)
GITHUB_TOKEN="ghp_your_token_here"

# Stripe Payment Processing  
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# HuggingFace AI/ML
HUGGINGFACE_HUB_TOKEN="hf_..."

# Azure Quantum Computing
AZURE_QUANTUM_WORKSPACE_ID="..."
AZURE_QUANTUM_SUBSCRIPTION_ID="..."

# Microsoft Clarity Analytics
CLARITY_PROJECT_ID="..."
```

## 🛠️ Phase 2: Core Implementation (Source Code Recovery)

### 2.1 Recreate Missing Source Files
**Evidence**: Jest coverage reports exist but source files are missing

```bash
# Based on coverage/lcov-report/ analysis:
# src/mcp/orchestrator.js - 78.51% statements (95/121), 51.16% branches (22/43)
# src/utils/logger.js - Coverage data available but files missing

# Create file structure:
mkdir -p src/{mcp,utils,ui,tests}
mkdir -p src/tests/{mcp,utils,ui}

# Implementation priority:
# 1. src/mcp/orchestrator.js - MCP server lifecycle management
# 2. src/utils/logger.js - Logging infrastructure  
# 3. src/index.js - Main application entry point
# 4. src/ui/ - MCP Control Tower dashboard (currently empty)
```

### 2.2 Jest Configuration Setup
Add to `package.json`:
```json
{
  "jest": {
    "collectCoverage": true,
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/**/*.test.js",
      "!src/ui/dist/**"
    ],
    "coverageThreshold": {
      "global": {
        "statements": 100,
        "branches": 100,
        "functions": 100,
        "lines": 100
      }
    },
    "coverageReporters": ["html", "lcov", "text-summary"],
    "testMatch": [
      "**/src/**/*.test.js",
      "**/tests/**/*.test.js"
    ]
  }
}
```

### 2.3 Replace Placeholder npm Scripts
**Current Problem**: All scripts echo 'not yet implemented'  
**Solution**: Implement actual functionality

```json
{
  "scripts": {
    "dev": "nodemon src/index.js --watch src --port 3000",
    "build": "npm run lint && npm run test && npm run build:ui",
    "build:ui": "webpack --mode production --config webpack.config.js",
    "test": "jest --coverage --verbose",
    "test:watch": "jest --watch --coverage",
    "start": "node src/index.js",
    "lint": "eslint src/ --ext .js",
    "lint:fix": "eslint src/ --ext .js --fix",
    "format": "prettier --write 'src/**/*.js'",
    "docs": "serve public/docs/ --port 4000",
    "mcp:status": "node src/utils/mcp-status-checker.js",
    "mcp:test": "node src/utils/mcp-integration-test.js"
  }
}
```

## 🏗️ Phase 3: Application Development 

### 3.1 MCP Control Tower Architecture
```bash
# Directory Structure:
src/
├── index.js                 # Main server entry point
├── mcp/
│   ├── orchestrator.js      # MCP server lifecycle management
│   ├── server-registry.js   # Dynamic server registration
│   └── health-monitor.js    # Server status monitoring
├── utils/
│   ├── logger.js           # Centralized logging
│   ├── config.js           # Environment configuration
│   └── mcp-status-checker.js # CLI status utility
├── ui/
│   ├── dashboard/          # MCP server management interface
│   ├── components/         # Reusable UI components
│   └── api/               # REST API for UI communication
└── tests/
    ├── mcp/               # MCP server tests
    ├── utils/             # Utility function tests
    └── ui/                # UI component tests
```

### 3.2 Technology Stack Implementation
```bash
# Core Dependencies (add to package.json)
npm install --save express cors helmet morgan
npm install --save @modelcontextprotocol/sdk
npm install --save ws socket.io

# Development Dependencies
npm install --save-dev nodemon webpack webpack-cli
npm install --save-dev jest eslint prettier
npm install --save-dev @eslint/js eslint-config-prettier

# Documentation Server
npm install --save-dev serve
```

### 3.3 Build Process Implementation
```bash
# Development Workflow:
1. Use VS Code Tasks (Ctrl+Shift+P → "Run Task")
2. Select emoji-prefixed task (e.g., "🌸 Start Control Tower (Dev)")
3. Monitor via integrated terminal
4. Use "🌀 Check MCP Server Status" for validation

# Production Build:
npm run build
# → Runs: lint → test (100% coverage) → build:ui → package

# Quality Gates:
- ESLint: Zero warnings/errors
- Jest: 100% coverage (statements, branches, functions, lines)  
- MCP Servers: 8/8 operational status
- Security: No critical vulnerabilities
```

## 🐱 Phase 4: Unity Avatar Development (Parallel Track)

### 4.1 Unity Project Setup
**Location**: Separate from Node.js project  
**Specifications**: Follow `public/docs/CATGIRL.md` (683 lines)

```bash
# Unity 6.2 LTS Installation (Linux)
# Follow public/docs/UNITY_SETUP_GUIDE.md

# Project Structure:
catgirl-avatar-project/
├── Assets/
│   ├── Scripts/
│   │   ├── Character/        # CatGirl controller & animation
│   │   ├── Inventory/        # RPG item system
│   │   ├── Economy/          # Universal banking
│   │   └── Networking/       # Multi-user support
│   ├── Prefabs/             # Reusable game objects
│   ├── Materials/           # Visual assets
│   └── Scenes/              # Game environments
├── Packages/                # Unity package dependencies
└── ProjectSettings/         # Unity configuration
```

### 4.2 Unity Package Dependencies
```json
// Packages/manifest.json
{
  "dependencies": {
    "com.unity.xr.interaction.toolkit": "3.0.5",
    "com.unity.netcode.gameobjects": "2.0.0",
    "com.unity.animation.rigging": "1.3.1",
    "com.unity.purchasing": "4.12.2",
    "com.unity.services.economy": "3.4.2",
    "com.unity.addressables": "2.3.1",
    "com.unity.timeline": "1.8.7"
  }
}
```

### 4.3 Unity Build Pipeline
```bash
# Development Workflow:
1. Unity Editor → XR testing with simulators
2. Build → Test → Deploy pipeline
3. Integration with MCP Control Tower for monetization APIs
4. Community deployment via Unity Cloud Build

# Key Features Implementation Order:
1. Basic CatGirl avatar with animations
2. XR eye/hand tracking integration  
3. RPG inventory system (16 equipment slots)
4. Universal banking (Gold, Cat Treats, Purr Points)
5. Multi-user networking
6. Community features (emote sharing, housing)
```

## 🔄 Phase 5: Integration & Deployment

### 5.1 Emoji-Driven CI/CD Implementation
Based on `public/docs/RELIGULOUS_MANTRA.md` patterns:

```yaml
# .github/workflows/emoji-ci.yml
name: "🌸 Emoji-Driven CI/CD"
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  detect-emoji-pattern:
    runs-on: ubuntu-latest
    steps:
      - name: Parse Commit Emojis
        run: |
          # 🌸 CHERRY_BLOSSOM → Package management
          # 👑 CROWN → Architecture decisions
          # 💎 GEM → Quality metrics enforcement
          # 🦋 BUTTERFLY → Transformation processes
          # ✨ SPARKLES → Server operations
          # 🎭 PERFORMING_ARTS → Deployment lifecycle
          
  test-coverage-enforcement:
    runs-on: ubuntu-latest
    steps:
      - name: "💎 Enforce 100% Coverage"
        run: |
          npm test
          # Fail if coverage < 100%
          
  mcp-server-validation:
    runs-on: ubuntu-latest
    steps:
      - name: "🌀 Verify 8/8 MCP Servers"
        run: |
          npm run mcp:status
          # Ensure all servers operational
```

### 5.2 Documentation Server Setup
```bash
# Port 4000 documentation server
# Serves public/docs/ content with navigation

# Implementation:
src/docs-server/
├── server.js              # Express server for docs
├── templates/             # HTML templates
└── static/                # CSS, JS assets

# Features:
- Live reload during development
- Search functionality across docs
- Navigation between MCP guides, Unity specs
- Emoji pattern reference
```

### 5.3 Production Deployment Strategy
```bash
# MCP Control Tower (Node.js)
# → Deploy to cloud platform with MCP server support
# → Environment variable configuration
# → Health monitoring and alerting
# → Auto-scaling based on MCP server load

# Unity Avatar System (C#)
# → Unity Cloud Build integration
# → Multi-platform deployment (VR/AR devices)
# → Community server infrastructure
# → Economic integration with MCP Control Tower APIs
```

## 📊 Development Metrics & Quality Gates

### Success Criteria (Must Pass):
- ✅ **8/8 MCP Servers Operational** (currently 3/8)
- ✅ **100% Jest Coverage** (currently ~79%)  
- ✅ **Zero npm Script Placeholders** (currently all echo statements)
- ✅ **MCP Control Tower UI Functional** (currently empty `src/ui/`)
- ✅ **Unity Avatar MVP Complete** (specs exist, implementation needed)
- ✅ **Security Vulnerabilities Resolved** (3 detected: 1 critical, 2 moderate)

### Build Quality Metrics:
```bash
# Automated Quality Checks:
npm run lint        # ESLint: Zero warnings/errors
npm run test        # Jest: 100% coverage enforcement
npm run mcp:status  # All 8 servers responding
npm audit           # No critical security issues
```

### Performance Targets:
- **MCP Server Response**: <100ms average
- **UI Load Time**: <2s initial render
- **Test Suite Execution**: <30s full coverage
- **Build Process**: <5min total pipeline
- **Unity Frame Rate**: 90fps VR, 60fps desktop

## 🛡️ Development Best Practices

### Emoji-Driven Commit Standards:
```bash
# Use combinations for complex changes:
git commit -m "🌸💎 Add Jest configuration with 100% coverage enforcement"
git commit -m "👑🌀 Restructure MCP server architecture for scalability"  
git commit -m "🦋✨ Implement missing orchestrator.js with health monitoring"
```

### VS Code Workflow Integration:
```bash
# Always use VS Code Tasks, not direct npm:
Ctrl+Shift+P → "Run Task" → "🌸 Start Control Tower (Dev)"
Ctrl+Shift+P → "Run Task" → "💎 Run Tests (100% Coverage)"
Ctrl+Shift+P → "Run Task" → "🌀 Check MCP Server Status"
```

### BambiSleep™ Organization Compliance:
- **Trademark**: Always use "BambiSleep™" with symbol in public materials
- **Attribution**: MIT license with proper BambiSleepChat organization credit
- **Repository**: Reference BambiSleepChat context in GitHub operations

---

*This BUILD plan implements the "Universal Machine Philosophy" with enterprise-grade infrastructure and "religulous" devotion to code quality. Follow the emoji-driven development patterns for machine-readable automation and maintain the sacred law: **100% test coverage or suffer in callback hell eternal**.*

**Next Steps**: Begin Phase 1 (MCP Server Configuration) → Phase 2 (Source Recovery) → Phase 3 (Implementation) → Phase 4 (Unity) → Phase 5 (Integration)
