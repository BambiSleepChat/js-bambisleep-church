# BambiSleep™ Church - WSL & VS Code Remote Development Setup
*🐧 Windows Subsystem for Linux Integration Guide 🐧*

## Overview

This guide implements Microsoft's official WSL + VS Code best practices for the BambiSleep™ Church project, enabling seamless cross-platform development between Windows and Linux environments.

**Reference**: [Microsoft Learn - WSL + VS Code Tutorial](https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-vscode)

---

## 📋 Prerequisites

### System Requirements

- **Windows 10** version 1903+ or **Windows 11**
- **WSL 2** installed and configured
- **VS Code** 1.35+ installed on Windows
- **Node.js 20+** installed in WSL
- **Git** configured in WSL

### Check Your Environment

```powershell
# PowerShell (Windows side)
wsl --list --verbose
wsl --status
node --version   # Should show >=20.0.0
npm --version    # Should show >=10.0.0
```

```bash
# WSL (Linux side)
uname -a
node --version
npm --version
git --version
```

---

## 🚀 Quick Start: WSL Setup

### 1. Install WSL 2 (if not installed)

```powershell
# PowerShell (as Administrator)
wsl --install

# Install specific distribution (e.g., Ubuntu)
wsl --install -d Ubuntu-22.04

# Set WSL 2 as default
wsl --set-default-version 2
```

### 2. Update Linux Distribution

```bash
# Inside WSL
sudo apt-get update
sudo apt-get upgrade -y

# Install essential development tools
sudo apt-get install -y wget ca-certificates curl git build-essential
```

### 3. Install Node.js 20 LTS in WSL

```bash
# Inside WSL - Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should output v20.x.x
npm --version   # Should output >=10.0.0
```

### 4. Configure Git in WSL

```bash
# Inside WSL
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global core.autocrlf input
git config --global core.eol lf

# Set up SSH keys for GitHub (optional but recommended)
ssh-keygen -t ed25519 -C "your.email@example.com"
cat ~/.ssh/id_ed25519.pub  # Add this to GitHub
```

---

## 🎯 VS Code Remote Development Setup

### 1. Install Required Extensions (Windows)

Open VS Code on Windows and install:

```
ms-vscode-remote.vscode-remote-extensionpack
```

This extension pack includes:
- **Remote - WSL** - Work in WSL filesystem
- **Remote - SSH** - Connect to remote machines
- **Remote - Containers** - Develop in Docker containers

### 2. Open Project in WSL

#### Method A: From Windows File Explorer
```powershell
# PowerShell - Navigate to project
cd f:\bambisleep-church
code .
```

Then in VS Code:
- Press `Ctrl+Shift+P`
- Type "WSL: Reopen Folder in WSL"
- Select your WSL distribution

#### Method B: From WSL Terminal
```bash
# Inside WSL
cd /mnt/f/bambisleep-church
code .
```

VS Code will automatically:
1. Install VS Code Server in WSL
2. Connect to the remote environment
3. Load all extensions configured for WSL

### 3. Verify WSL Connection

Check the **bottom-left corner** of VS Code:
- Should show: `WSL: Ubuntu` (or your distribution name)
- Green indicator means connected

---

## 🔧 Project-Specific Setup

### 1. Install Project Dependencies (in WSL)

```bash
# Inside WSL terminal in VS Code
cd /mnt/f/bambisleep-church
npm install
```

### 2. Configure Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your tokens
nano .env  # or use VS Code editor
```

Required environment variables:
```bash
# GitHub Integration
GITHUB_TOKEN=ghp_your_token_here

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# HuggingFace AI/ML
HUGGINGFACE_HUB_TOKEN=hf_...

# Azure Quantum Computing
AZURE_QUANTUM_WORKSPACE_ID=...
AZURE_QUANTUM_SUBSCRIPTION_ID=...

# Microsoft Clarity Analytics
CLARITY_PROJECT_ID=...

# Session Configuration
SESSION_SECRET=change-this-secret-in-production
```

### 3. Verify MCP Server Configuration

All 8 MCP servers are pre-configured in `.vscode/settings.json`:

✅ **filesystem** - File operations  
✅ **git** - Git version control  
✅ **github** - GitHub integration (requires `GITHUB_TOKEN`)  
✅ **mongodb** - Database operations  
✅ **stripe** - Payment processing (requires `STRIPE_SECRET_KEY`)  
✅ **huggingface** - AI/ML models (requires `HUGGINGFACE_HUB_TOKEN`)  
✅ **azure-quantum** - Quantum computing  
✅ **clarity** - Analytics (requires `CLARITY_PROJECT_ID`)  

### 4. Install WSL-Specific Extensions

When working in WSL, install these extensions **in WSL** (not just Windows):

- ESLint
- Prettier
- GitHub Copilot
- GitHub Copilot Chat
- Docker
- Jest

VS Code will prompt you to install them in WSL automatically.

---

## 🛠️ Development Workflow

### Running the Development Server

Use VS Code tasks (recommended) or terminal commands:

#### Option A: VS Code Tasks
1. Press `Ctrl+Shift+P`
2. Type "Run Task"
3. Select "✨ Start Control Tower (Dev)"

#### Option B: Terminal
```bash
# Inside WSL terminal in VS Code
npm run dev
```

The server will start at `http://localhost:3000`

### Testing

```bash
# Run all tests with coverage
npm test

# Watch mode for development
npm run test:watch

# CI mode (for GitHub Actions)
npm run test:ci
```

### Linting & Formatting

```bash
# Lint code
npm run lint

# Fix lint issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without changing files
npm run format:check
```

### Docker Operations

```bash
# Build Docker image
npm run docker:build

# Start services with Docker Compose
npm run docker:up

# Stop services
npm run docker:down

# View logs
npm run docker:logs
```

---

## 🎯 Emoji-Driven Development Workflow

This project follows emoji-prefixed commit patterns from `RELIGULOUS_MANTRA.md`:

### Git Commit Patterns

```bash
# Package management
git commit -m "🌸 Add nodemon for hot-reload development"

# Architecture changes
git commit -m "👑 Refactor MCP orchestrator for better scalability"

# Quality improvements
git commit -m "💎 Add comprehensive unit tests for auth middleware"

# Server operations
git commit -m "✨ Configure MongoDB MCP server with connection pooling"

# Deployment
git commit -m "🎭 Set up PM2 ecosystem for production deployment"

# Migrations
git commit -m "🦋 Migrate legacy routes to new Express router pattern"

# Combined patterns
git commit -m "🌸💎 Add Jest and achieve 100% test coverage"
```

### Standard Workflow

```bash
# 1. Make changes in WSL-connected VS Code
# 2. Run tests
npm test

# 3. Lint and format
npm run lint:fix
npm run format

# 4. Commit with emoji pattern
git add .
git commit -m "🌸💎 <your_message>"

# 5. Push to GitHub
git push
```

---

## 🔍 Troubleshooting

### Common Issues

#### Issue: "code command not found in WSL"

**Solution**:
```bash
# Add VS Code to PATH
export PATH="$PATH:/mnt/c/Users/YourUsername/AppData/Local/Programs/Microsoft VS Code/bin"

# Add to ~/.bashrc for persistence
echo 'export PATH="$PATH:/mnt/c/Users/YourUsername/AppData/Local/Programs/Microsoft VS Code/bin"' >> ~/.bashrc
```

#### Issue: "Permission denied" when installing npm packages

**Solution**:
```bash
# Fix npm permissions (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### Issue: Line ending issues (CRLF vs LF)

**Solution**:
```bash
# Configure Git for Unix line endings
git config --global core.autocrlf input
git config --global core.eol lf

# Fix existing files
npm run format
```

#### Issue: MCP servers not connecting

**Solution**:
1. Verify environment variables in `.env`
2. Check VS Code MCP extension logs
3. Restart VS Code in WSL mode
4. Check that `npx` is available in WSL:
   ```bash
   which npx
   npx --version
   ```

#### Issue: Port already in use (EADDRINUSE)

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

---

## 🚀 Performance Optimization

### WSL 2 Performance Best Practices

1. **Store code in WSL filesystem** (not `/mnt/c/`)
   ```bash
   # Move project to WSL (optional)
   mv /mnt/f/bambisleep-church ~/projects/bambisleep-church
   cd ~/projects/bambisleep-church
   ```

2. **Configure `.wslconfig`** (Windows side)
   ```ini
   # C:\Users\YourUsername\.wslconfig
   [wsl2]
   memory=8GB
   processors=4
   swap=4GB
   ```

3. **Disable Windows Defender for WSL files**
   - Add exclusion for: `%LOCALAPPDATA%\Packages\CanonicalGroupLimited.*`

4. **Use WSL-native Git**
   ```bash
   # Always use Git inside WSL, not Windows Git
   which git  # Should show /usr/bin/git
   ```

---

## 📚 Additional Resources

### Official Documentation
- [Microsoft WSL Documentation](https://learn.microsoft.com/en-us/windows/wsl/)
- [VS Code WSL Tutorial](https://code.visualstudio.com/docs/remote/wsl-tutorial)
- [VS Code Remote Development](https://code.visualstudio.com/docs/remote/remote-overview)

### Project-Specific Documentation
- `BUILD.md` - Complete build process and architecture
- `TODO.md` - Implementation checklist
- `README.md` - Project overview
- `docs/GETTING_STARTED.md` - Quick start guide
- `docs/UPGRADE_SUMMARY.md` - WSL & VS Code upgrade details

### VS Code Extensions
- [Remote Development Extension Pack](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)
- [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

---

## ✅ Verification Checklist

Before starting development, verify:

- [ ] WSL 2 is installed and running
- [ ] VS Code Remote Development extension pack is installed
- [ ] Project opens in WSL mode (check bottom-left corner)
- [ ] Node.js 20+ is installed in WSL
- [ ] npm dependencies are installed (`npm install`)
- [ ] `.env` file is configured with required tokens
- [ ] All 8 MCP servers are configured in `.vscode/settings.json`
- [ ] Tests run successfully (`npm test`)
- [ ] Dev server starts (`npm run dev`)
- [ ] ESLint and Prettier are working
- [ ] Git is configured with correct user info

---

## 🎉 Next Steps

1. **Complete MCP Server Setup**: Follow `public/docs/MCP_SETUP_GUIDE.md`
2. **Review Architecture**: Read `BUILD.md` for project structure
3. **Start Development**: Use emoji-prefixed commits from `RELIGULOUS_MANTRA.md`
4. **Achieve 100% Coverage**: Run `npm test` and improve coverage

---

**BambiSleep™ Church** | *MCP Control Tower & Unity Avatar Development*  
**Organization**: [BambiSleepChat](https://github.com/BambiSleepChat)  
**License**: MIT
