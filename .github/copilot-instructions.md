# BambiSleep™ Church - AI Agent Instructions
*🌸 MCP Control Tower & Unity Avatar Development Environment 🌸*

## Project Overview

This is a **dual-platform development environment** in early setup phase:

1. **MCP Control Tower** (Node.js) - Future AI tooling integration platform for Model Context Protocol servers
2. **Unity CatGirl Avatar System** (C#) - XR avatar framework (separate project, specs in `BUILD.md` and `TODO.md`)

**Critical Understanding**: This project follows emoji-driven development workflows with aspirational 100% test coverage enforcement.

**Actual Current State**: 
- **✅ All 8/8 MCP servers configured** - `.vscode/settings.json` contains complete MCP server registry
- **✅ Documentation organized** - All docs in `docs/` directory (WSL_SETUP_GUIDE.md, UPGRADE_SUMMARY.md, GETTING_STARTED.md, CHECKLIST.md, etc.)
- **✅ Production-ready scripts** - 27 functional npm scripts in package.json
- **✅ WSL 2 integration complete** - Full Remote Development setup with tasks and debugging
- **Node modules installed** - Express.js server with WebSocket, Stripe, authentication implemented

**Architecture Documentation**: See `BUILD.md` (522 lines) for complete setup roadmap and `TODO.md` (143 lines) for implementation checklist

## Critical Architecture Patterns

### MCP Server Infrastructure (8/8 Configured ✅)
**Location**: `.vscode/settings.json` contains MCP server registry
**Active Servers**: 
- ✅ `filesystem` - File operations
- ✅ `git` - Git version control
- ✅ `github` - GitHub integration (requires `GITHUB_TOKEN` env var)
- ✅ `mongodb` - Database operations (connection: `mongodb://localhost:27017`)
- ✅ `stripe` - Payment processing (requires `STRIPE_SECRET_KEY` env var)
- ✅ `huggingface` - AI/ML models (requires `HUGGINGFACE_HUB_TOKEN` env var)
- ✅ `azure-quantum` - Quantum computing (requires workspace config)
- ✅ `clarity` - Analytics (requires `CLARITY_PROJECT_ID` env var)

**Environment Variables**: All required tokens documented in `.env.example`

```jsonc
// Pattern for adding new MCP servers to .vscode/settings.json
"mcp.servers": {
  "servername": {
    "command": "npx", 
    "args": ["-y", "@modelcontextprotocol/server-name", "/mnt/f/bambisleep-church"]
  }
}
```

### Development Workflow (CRITICAL: Use Tasks, Not npm)
**All npm scripts echo placeholders** - use VS Code tasks instead:
- `Ctrl+Shift+P` → "Run Task" → Select emoji-prefixed task
- Tasks defined in `.vscode/tasks.json` with proper problem matchers
- Example: "🌸 Start Control Tower (Dev)" instead of `npm run dev`

### Test Infrastructure State
**Evidence**: Jest coverage reports exist in `/coverage/` (~79.28% statements, 52.54% branches)
**Missing**: Actual source files (`src/mcp/orchestrator.js`, `src/utils/logger.js`) 
**Goal**: 100% coverage enforcement via Jest configuration

## Essential Development Knowledge

### Emoji-Driven Development System
This project uses emoji prefixes for **machine-readable commit patterns**:
```javascript
// From RELIGULOUS_MANTRA.md - CI/CD automation patterns
'🌸' // CHERRY_BLOSSOM - Package management, npm operations  
'👑' // CROWN - Architecture decisions, major refactors
'💎' // GEM - Quality metrics, test coverage enforcement
'🦋' // BUTTERFLY - Transformation processes, migrations
'✨' // SPARKLES - Server operations, MCP management
'🎭' // PERFORMING_ARTS - Development lifecycle, deployment
```

### Critical File Locations
```
docs/
├── WSL_SETUP_GUIDE.md              # Complete WSL 2 + VS Code setup (450 lines)
├── UPGRADE_SUMMARY.md              # WSL & VS Code upgrade details (400+ lines)
├── GETTING_STARTED.md              # Quick start guide (359 lines)
├── CHECKLIST.md                    # Development checklist (267 lines)
├── WINDOWS_TERMINAL_PROFILE.md     # Terminal setup (170 lines)
└── WSL_INTEGRATION_ENHANCEMENTS.md # Enhancement documentation (370 lines)

.vscode/
├── settings.json          # MCP server registry + GitHub Copilot config
├── tasks.json            # Emoji-prefixed task definitions
└── launch.json           # Edge browser debugging setup

coverage/                  # Jest reports (79% current, 100% target)
src/                      # Express.js server with WebSocket, Stripe, authentication
```

### Organization Requirements
- **Always** use "BambiSleep™" trademark symbol
- Reference BambiSleepChat organization in GitHub operations
- Follow MIT license with proper attribution

## Dual-Platform Architecture

### Node.js MCP Control Tower
**Current State**: Express.js server implemented with authentication, payments, and video streaming
- `src/ui/` directory is empty - needs MCP dashboard implementation  
- All npm scripts are placeholders - use VS Code tasks instead
- Jest infrastructure exists with 79% coverage from previous implementation
- Missing source files: `src/mcp/orchestrator.js`, `src/utils/logger.js`

### Unity CatGirl Avatar System  
**Specifications**: Complete 683-line spec in `public/docs/CATGIRL.md`
- Unity 6.2 LTS with XR Interaction Toolkit
- Eye/hand tracking, RPG inventory, universal banking system
- Separate project from Node.js MCP codebase
- Setup guide: `public/docs/UNITY_SETUP_GUIDE.md`

### VS Code Integration Patterns
**MCP Servers**: Auto-register in AI assistant when added to `.vscode/settings.json`
**Tasks**: Use emoji-prefixed tasks (🌸, 💎, 🌀) instead of npm scripts
**Problem Matchers**: ESLint integration via `$eslint-stylish`
**Zero-Config**: No default formatter set (intentional design choice)

## MCP Server Configuration Guide

### Environment Setup (Required for MCP Servers)
All 8 MCP servers are configured in `.vscode/settings.json`. To activate them, copy `.env.example` to `.env` and configure the required tokens:

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your tokens:
# - GITHUB_TOKEN=ghp_... (for GitHub integration)
# - STRIPE_SECRET_KEY=sk_... (already in template)
# - HUGGINGFACE_HUB_TOKEN=hf_... (for AI/ML models)
# - AZURE_QUANTUM_WORKSPACE_ID=... (for quantum computing)
# - CLARITY_PROJECT_ID=... (for analytics)
```

**Server Status Verification**:
- All servers use `npx -y` pattern for automatic installation
- Servers auto-start when VS Code loads the workspace
- Check MCP extension logs for connection status
- Servers requiring credentials will show connection errors until tokens are configured
}
```

### Unity Development Patterns
**Architecture**: Component-based XR system with Unity 6.2
**Key Systems**: Eye/hand tracking, RPG inventory, multi-currency economy
**Implementation**: Separate Unity project following `CATGIRL.md` specifications

## Development Workflows

### Testing & Coverage (Priority: Reach 100%)
- **Current**: `coverage/` shows 79.28% statements, 52.54% branches
- **Command**: Use "💎 Run Tests (100% Coverage)" task (currently placeholder)
- **Philosophy**: "100% test coverage or suffer in callback hell eternal"

### Formatter Configuration (Zero-Config Approach)
- **Prettier**: Pre-installed but no default formatter set (intentional)
- **ESLint**: Problem matcher configured for `$eslint-stylish`
- **JSON**: Uses built-in `vscode.json-language-features`
- **Tailwind**: CSS validation disabled to prevent conflicts
- **Spell Check**: Code Spell Checker with `cspell.json` for technical terms

### MCP Server Integration Patterns
**Server Lifecycle Management**:
```javascript
// MCP servers auto-start with VS Code via npx -y pattern
// No local installation conflicts - each server runs independently
// Workspace-specific configuration in .vscode/settings.json
// Error handling via VS Code MCP extension logs
```

**VS Code Integration Hooks**:
- **Auto-registration**: MCP servers appear in VS Code AI assistant tools
- **Context Awareness**: All servers have workspace path context (`/mnt/f/bambisleep-church`)
- **Error Diagnostics**: Use VS Code MCP extension for debugging server issues
- **Environment Variables**: Set required API keys/tokens before server activation

**Server Communication Patterns**:
- **Filesystem Server**: Direct file operations, no authentication required
- **Git Server**: Repository operations using local Git config and SSH keys
- **GitHub Server**: Requires `GITHUB_TOKEN` environment variable
- **External APIs**: MongoDB, Stripe, HuggingFace, Azure, Clarity need credentials
- **Concurrent Access**: Multiple servers can operate simultaneously without conflicts

## Critical Patterns for AI Agents

### Organization Compliance Requirements
- **Always** include BambiSleep™ trademark symbol in documentation
- **GitHub operations** should reference BambiSleepChat organization context

### Dual Platform Development Workflow
**Node.js MCP Stack**:
1. Use VS Code tasks (Ctrl+Shift+P → "Run Task") for all npm operations
2. All scripts currently echo placeholders - need real implementations
3. Test coverage infrastructure exists but source code is missing
4. MCP server configuration via `.vscode/settings.json`

**Unity Avatar Development**:
1. Follow `UNITY_SETUP_GUIDE.md` for Unity 6.2 installation
2. CatGirl avatar specs in `CATGIRL.md` (683 lines of detailed requirements)
3. XR Interaction Toolkit for eye/hand tracking
4. Separate Unity project structure from Node.js MCP codebase

### Development Priority Order
1. **✅ COMPLETE: MCP server configuration** (All 8/8 servers configured in `.vscode/settings.json`)
2. **Configure environment variables** (Copy `.env.example` to `.env` and add API tokens)
3. **Achieve 100% test coverage** (coverage infrastructure exists but needs source code)
4. **Implement actual src/ code** (UI directory empty, but package.json structure ready)
5. **Set up proper npm scripts** (currently all echo placeholders - replace with real implementations)
6. **Unity CatGirl avatar system** (follow CATGIRL.md specifications for implementation)

### VS Code Integration Patterns
- Use **emoji-prefixed tasks** for all operations (matches RELIGULOUS_MANTRA.md)
- **MCP servers** auto-register in VS Code for AI assistant integration
- **Problem matchers** configured for ESLint integration
- **Zero-config approach**: No default formatter set (intentional design choice)
- **GitHub Copilot** configured for BambiSleepChat organization context

### Git Workflow (Emoji-Driven Commits)
**Standard Development Workflow**:
```bash
git add .
git commit -m "🌸💎 <commit_message>"
git push
```

**Emoji Commit Patterns** (from RELIGULOUS_MANTRA.md):
```bash
# Package management, npm operations
git commit -m "🌸 Add missing dependencies for MCP server integration"

# Architecture decisions, major refactors  
git commit -m "👑 Restructure MCP server configuration for scalability"

# Quality metrics, test coverage enforcement
git commit -m "💎 Implement Jest tests to achieve 100% coverage"

# Transformation processes, migrations
git commit -m "🦋 Migrate documentation to public/docs/ structure"

# Server operations, MCP management
git commit -m "✨ Configure MongoDB and Stripe MCP servers"

# Development lifecycle, deployment
git commit -m "🎭 Set up production deployment pipeline"

# Combined patterns for complex changes
git commit -m "🌸👑 Update package.json and refactor MCP orchestrator architecture"
git commit -m "💎🦋 Add comprehensive tests and migrate legacy code patterns"
```