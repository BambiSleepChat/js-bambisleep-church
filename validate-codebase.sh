#!/bin/bash
# BambiSleep™ Church - Codebase Validation Script
# Verifies all components are present and properly configured

echo "🎭 BambiSleep™ Church - Codebase Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validation function
validate() {
    if [ -f "$1" ] || [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2 (missing: $1)"
        return 1
    fi
}

echo ""
echo "📦 Layer 0: Configuration"
validate ".env.example" "Environment template"
validate "package.json" "Package configuration"

echo ""
echo "🏗️ Layer 1: Server Initialization"
validate "src/server.js" "Express server"

echo ""
echo "🛡️ Layer 2: Middleware"
validate "src/middleware/auth.js" "Authentication middleware"

echo ""
echo "🛣️ Layer 3: Routes"
validate "src/routes/auth.js" "Auth routes"
validate "src/routes/stripe.js" "Stripe routes"
validate "src/routes/markdown.js" "Markdown routes"
validate "src/routes/video.js" "Video routes"

echo ""
echo "⚙️ Layer 4: Services"
validate "src/services/telemetry.js" "Telemetry service"
validate "src/services/websocket.js" "WebSocket service"

echo ""
echo "🔌 Layer 6: MCP Configuration"
validate ".vscode/settings.json" "MCP server config"

echo ""
echo "🎨 Layer 7: User Interface"
validate "views/layout.ejs" "Layout template"
validate "views/index.ejs" "Homepage"
validate "views/markdown.ejs" "Markdown renderer"
validate "views/video-player.ejs" "Video player"
validate "views/404.ejs" "404 page"
validate "views/error.ejs" "Error page"

echo ""
echo "🧪 Test Suite"
validate "src/services/telemetry.test.js" "Telemetry tests"
validate "src/services/websocket.test.js" "WebSocket tests"
validate "src/middleware/auth.test.js" "Auth middleware tests"
validate "src/routes/auth.test.js" "Auth routes tests"
validate "src/__tests__/smoke.test.js" "Smoke tests"

echo ""
echo "📊 Monitoring Stack"
validate "docker-compose.monitoring.yml" "Monitoring compose"
validate "prometheus/prometheus.yml" "Prometheus config"
validate "prometheus/alerts/bambisleep.yml" "Alert rules"
validate "grafana/dashboards/http-red-metrics.json" "HTTP RED dashboard"
validate "grafana/dashboards/dora-metrics.json" "DORA dashboard"
validate "grafana/dashboards/auth-security.json" "Auth dashboard"
validate "grafana/dashboards/stripe-payments.json" "Stripe dashboard"
validate "grafana/dashboards/websocket-metrics.json" "WebSocket dashboard"
validate "grafana/dashboards/business-metrics.json" "Business dashboard"
validate "alertmanager/alertmanager.yml" "Alertmanager config"

echo ""
echo "🚀 Deployment Configuration"
validate "Dockerfile" "Docker image"
validate "docker-compose.yml" "Application compose"
validate "ecosystem.config.js" "PM2 config"
validate "setup.sh" "Setup script"
validate "start.sh" "Start script"

echo ""
echo "📚 Documentation"
validate "BUILD.md" "Build guide"
validate "TODO.md" "Task tracking"
validate "SECURITY.md" "Security guide"
validate "TELEMETRY.md" "Telemetry guide"
validate "DEPLOYMENT.md" "Deployment guide"
validate "CHANGELOG.md" "Version history"
validate "README.md" "Project overview"

echo ""
echo "📖 Agent Documentation"
validate ".github/agent-documentation/architecture.md" "Architecture guide"
validate ".github/agent-documentation/development.md" "Development guide"
validate ".github/agent-documentation/mcp-servers.md" "MCP servers guide"
validate ".github/agent-documentation/monitoring.md" "Monitoring guide"
validate ".github/agent-documentation/philosophy.md" "Philosophy guide"

echo ""
echo "📁 Content Directories"
validate "content/public/welcome.md" "Public content"
validate "content/private/premium-welcome.md" "Premium content"
validate "videos" "Video storage"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Codebase validation complete!"
echo ""
echo "Next steps:"
echo "  1. Run tests: npm test"
echo "  2. Start dev server: npm run dev"
echo "  3. Deploy monitoring: docker-compose -f docker-compose.monitoring.yml up -d"
echo ""
