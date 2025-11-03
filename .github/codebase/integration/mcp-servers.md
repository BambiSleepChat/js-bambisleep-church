# MCP Server Configuration & Usage

## 🔧 8 MCP Servers (All Configured)

**Location:** `.vscode/settings.json` (287 lines)  
**Pattern:** All use `npx -y @modelcontextprotocol/server-{name}`

```jsonc
filesystem      // File operations (/mnt/f/bambisleep-church)
git             // Version control
github          // Requires GITHUB_TOKEN env var
mongodb         // Requires mongodb://localhost:27017
stripe          // Requires STRIPE_SECRET_KEY env var
huggingface     // Requires HUGGINGFACE_HUB_TOKEN env var
azure-quantum   // Quantum computing (requires workspace config)
clarity         // Analytics (requires CLARITY_PROJECT_ID env var)
```

**Important:** MCP servers are **development tools only** (VS Code extensions) — they do NOT run in production.

---

## 🤖 How AI Agents Use MCP Servers (Practical Examples)

### **1. Filesystem Server** - Read/write project files

```javascript
// AI agent can: Read source code, create new files, analyze directory structure
// Example: "Show me all routes that use requireAuth middleware"
// → Server searches src/routes/*.js for requireAuth imports
```

### **2. Git Server** - Version control operations

```javascript
// AI agent can: Check git status, create branches, view commit history
// Example: "What files changed in the last commit?"
// → Server runs: git diff HEAD~1..HEAD --name-only
```

### **3. GitHub Server** - Repository management via API

```javascript
// AI agent can: Create PRs, list issues, search code across repos
// Example: "Find all TODOs in BambiSleepChat/bambisleep-church"
// → Server uses GitHub Code Search API
```

### **4. MongoDB Server** - Database queries (when DB is integrated)

```javascript
// AI agent can: Query collections, update documents, aggregate data
// Example: "How many users registered this week?"
// → Server runs: db.users.countDocuments({createdAt: {$gte: weekAgo}})
```

### **5. Stripe Server** - Payment platform operations

```javascript
// AI agent can: List customers, check subscription status, create products
// Example: "Show active subscriptions for user@example.com"
// → Server calls: stripe.subscriptions.list({customer: customerId, status: 'active'})
```

### **6. HuggingFace Server** - ML model discovery and usage

```javascript
// AI agent can: Search models, download datasets, run inference
// Example: "Find sentiment analysis models"
// → Server searches HuggingFace Hub with tags: ['sentiment-analysis']
```

### **7. Azure Quantum Server** - Quantum computing operations

```javascript
// AI agent can: Submit Q# programs, check job status, get results
// Example: "Run quantum random number generator on IonQ"
// → Server submits job to Azure Quantum workspace
```

### **8. Clarity Server** - Analytics tracking

```javascript
// AI agent can: Fetch heatmaps, analyze user behavior, track events
// Example: "What pages have highest bounce rate?"
// → Server queries Clarity API for session analytics
```

---

## 🔑 MCP Server Setup

### **Environment Variables Required**

```bash
# Copy .env.example to .env and add these keys:
GITHUB_TOKEN=ghp_...                          # For GitHub server
STRIPE_SECRET_KEY=sk_test_...                 # For Stripe server
HUGGINGFACE_HUB_TOKEN=hf_...                  # For HuggingFace server
CLARITY_PROJECT_ID=...                        # For Clarity server (optional)

# MongoDB (localhost default)
MONGODB_URI=mongodb://localhost:27017

# Azure Quantum (requires workspace config)
AZURE_QUANTUM_WORKSPACE_ID=...
AZURE_QUANTUM_LOCATION=...
AZURE_QUANTUM_RESOURCE_GROUP=...
```

### **MCP Servers Auto-Start**

MCP servers automatically start when VS Code loads, as configured in `.vscode/settings.json`. No manual setup required beyond environment variables.

---

## 🚨 Common MCP Issues

| Issue | Solution |
|-------|----------|
| MCP server not starting | Check environment variables in `.env` |
| `npx` command not found | Ensure Node.js and npm are in PATH |
| Conflicting server versions | Use `npx -y` flag (auto-installs latest) |
| MongoDB connection refused | Start local MongoDB: `mongod --dbpath ./data` |
| GitHub rate limits | Use authenticated `GITHUB_TOKEN` |

---

## 📖 Additional Resources

- **MCP Documentation**: Model Context Protocol official specs
- **`.vscode/MCP_CONFIG_NOTES.md`**: Redundancy analysis with global config
- **DEPLOYMENT.md**: Production deployment guide (excludes MCP servers)
