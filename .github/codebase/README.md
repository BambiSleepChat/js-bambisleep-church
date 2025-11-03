# BambiSleep™ Church - Codebase Documentation

**Comprehensive documentation for AI agents and developers**

This directory contains all essential documentation for understanding, developing, and maintaining the BambiSleep™ Church MCP Control Tower.

---

## 📁 Directory Structure

```
.github/codebase/
├── README.md                    # This file - navigation hub
├── architecture/
│   └── architecture.md          # 8-layer system design (178 lines)
├── development/
│   └── development.md           # Workflow & testing (112 lines)
├── integration/
│   └── mcp-servers.md           # 8 MCP servers (97 lines)
├── operations/
│   └── monitoring.md            # Observability stack (159 lines)
├── philosophy/
│   └── philosophy.md            # 6 Genesis Questions (73 lines)
└── reference/
    └── QUICK_REFERENCE.md       # Commands & setup (180 lines)
```

**Total:** ~800 lines of focused documentation

---

## 📚 Documentation Index

### 🏗️ Architecture & Design
**Folder:** `architecture/`

- **[architecture.md](architecture/architecture.md)** - System design, 8-layer lattice, security patterns, failure modes

### 🛠️ Development Guides
**Folder:** `development/`

- **[development.md](development/development.md)** - VS Code workflows, Windows/PowerShell, testing, emoji git commits

### 🤖 MCP Integration
**Folder:** `integration/`

- **[mcp-servers.md](integration/mcp-servers.md)** - 8 MCP server configurations, environment variables, AI agent examples

### 📊 Monitoring & Observability
**Folder:** `operations/`

- **[monitoring.md](operations/monitoring.md)** - Prometheus, Grafana (6 dashboards), alerts, DORA metrics

### 🧬 Philosophy & Intent
**Folder:** `philosophy/`

- **[philosophy.md](philosophy/philosophy.md)** - The 6 Genesis Questions, sacred invariants, learnings

### 🎯 Quick Reference
**Folder:** `reference/`

- **[QUICK_REFERENCE.md](reference/QUICK_REFERENCE.md)** - Commands, setup, troubleshooting, deployment

---

## 🎭 Reading Order by Role

### New Developers
1. `philosophy/philosophy.md` - Understand the "why"
2. `architecture/architecture.md` - Learn the structure
3. `development/development.md` - Set up workflow
4. `reference/QUICK_REFERENCE.md` - Get commands

### AI Agents
1. `architecture/architecture.md` - System structure and patterns
2. `integration/mcp-servers.md` - Available tools and capabilities
3. `development/development.md` - Workflow and conventions

### DevOps/Operations
1. `architecture/architecture.md` - Deployment layers
2. `operations/monitoring.md` - Full observability stack
3. `reference/QUICK_REFERENCE.md` - Commands and health checks

---

## 📊 Key Topics by Document

| Topic | Document | Key Content |
|-------|----------|-------------|
| System Architecture | architecture.md | 8-layer lattice, security patterns |
| Development Setup | development.md | VS Code tasks, Windows/PowerShell |
| AI Integration | mcp-servers.md | 8 MCP servers, environment vars |
| Observability | monitoring.md | Prometheus, Grafana, 6 dashboards |
| System Intent | philosophy.md | 6 Genesis Questions, invariants |
| Quick Commands | QUICK_REFERENCE.md | Setup, testing, deployment |

---

## 🔗 Related Documentation

**Project Root:**
- `BUILD.md` - Build instructions
- `SECURITY.md` - OWASP ASM compliance (350+ lines)
- `TELEMETRY.md` - Observability architecture (497 lines)
- `DEPLOYMENT.md` - Production deployment
- `README.md` - Project overview

---

## 📝 Maintenance Guidelines

**Last Updated:** November 3, 2025  
**Status:** ✅ Complete and organized

When updating documentation:
- Keep the 8-layer architecture as foundation
- Document all Sacred Invariants
- Include practical code examples
- Update metrics and statistics
- Use emoji-driven commits: 🦋 for documentation

---

**BambiSleep™ is a trademark of BambiSleepChat** | **License:** MIT
