# BambiSleep™ Church Production Upgrade Summary

**Date**: 2025-11-03  
**Upgrade Type**: Custom MCP Server Integration + Agent Authority System  
**Source**: bambisleep-chat-catgirl production scaffolding

---

## 🌸 What Was Added

### 1. Custom MCP Server Integration (Layer 2)

Added **4 custom MCP servers** from `bambisleep-chat-catgirl`:

#### bambisleep-hypnosis-mcp

- **Purpose**: Audio file and playlist management
- **Tools**: 5 (add_audio_file, search_audio, create_playlist, get_playlist, list_triggers)
- **Resources**: 2 (audio library, playlists)
- **Path**: `../bambisleep-chat-catgirl/mcp-servers/bambisleep-hypnosis-mcp/`

#### aigf-personality-mcp

- **Purpose**: AI girlfriend personality switching and mood management
- **Tools**: 6 (create_personality, switch_personality, update_mood, add_context, get_trigger_response, list_profiles)
- **Resources**: 2 (active profile, all profiles)
- **Prompts**: 2 (personality_greeting, personality_response)
- **Path**: `../bambisleep-chat-catgirl/mcp-servers/aigf-personality-mcp/`

#### trigger-system-mcp

- **Purpose**: Hypnotic trigger registration with compliance enforcement
- **Tools**: 6 (register_trigger, activate_trigger, search_triggers, get_trigger, get_activation_history,
  get_compliance_stats)
- **Resources**: 3 (registry, logs, compliance stats)
- **Ethical Safeguards**: Compliance acknowledgment required for activation
- **Path**: `../bambisleep-chat-catgirl/mcp-servers/trigger-system-mcp/`

#### chat-analytics-mcp

- **Purpose**: User engagement and conversion tracking
- **Tools**: 7 (start_session, end_session, record_message, record_trigger_activation, record_conversion, get_analytics,
  get_user_engagement)
- **Resources**: 5 (active sessions, completed sessions, user engagement, conversions, summary)
- **Path**: `../bambisleep-chat-catgirl/mcp-servers/chat-analytics-mcp/`

### 2. MCP Server Manager Service

**File**: `src/services/mcp-manager.js` (283 lines)

**Features**:

- **EventEmitter-based lifecycle management** for child processes
- **Automatic retry logic** with exponential backoff (max 3 retries)
- **Graceful shutdown** with SIGTERM → 2s wait → SIGKILL fallback
- **Process monitoring** with stdout/stderr logging
- **Status API** for health checks

**Ring Layer Architecture**:

```
Layer 0: Primitives (filesystem, memory)
Layer 1: Foundation (git, github, brave-search)
Layer 2: Advanced (custom MCP servers) ← NEW
```

### 3. Server Integration

**Modified**: `src/server.js`

**Changes**:

1. Import `mcpManager` from `./services/mcp-manager.js`
2. Call `mcpManager.initialize()` after WebSocket setup
3. Added `/api/mcp/status` endpoint for server status
4. Added `await mcpManager.shutdown()` to SIGTERM/SIGINT handlers
5. Display MCP server count in startup banner

### 4. Environment Configuration

**Modified**: `.env.example`

**New Variables**:

```bash
# Custom MCP Servers (Layer 2 - Advanced)
ENABLE_HYPNOSIS_MCP=true
ENABLE_PERSONALITY_MCP=true
ENABLE_TRIGGER_SYSTEM_MCP=true
ENABLE_ANALYTICS_MCP=true

# Optional path overrides
HYPNOSIS_MCP_PATH=/path/to/...
PERSONALITY_MCP_PATH=/path/to/...
TRIGGER_SYSTEM_MCP_PATH=/path/to/...
ANALYTICS_MCP_PATH=/path/to/...

# Audio storage
BAMBISLEEP_AUDIO_PATH=/mnt/f/bambisleep-church/audio
```

---

## 🚀 How To Use

### Starting the Server

```bash
# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

The server will automatically:

1. Initialize OpenTelemetry observability
2. Start Express HTTP server on port 3000
3. Initialize WebSocket server
4. **Start 4 custom MCP servers** as child processes
5. Monitor MCP server health with auto-restart

### Checking MCP Server Status

**HTTP API**:

```bash
curl http://localhost:3000/api/mcp/status
```

**Response**:

```json
{
  "servers": [
    {
      "id": "bambisleep-hypnosis-mcp",
      "name": "BambiSleep™ Hypnosis Audio Management",
      "layer": 2,
      "enabled": true,
      "status": "running",
      "pid": 12345,
      "startTime": "2025-11-03T12:00:00.000Z",
      "tools": 5,
      "resources": 2
    }
    // ... 3 more servers
  ],
  "total": 4,
  "running": 4
}
```

### Startup Logs

```
[MCP-Manager] Initializing custom MCP servers...
[MCP-Manager] Starting BambiSleep™ Hypnosis Audio Management (bambisleep-hypnosis-mcp)...
[MCP-Manager] Started bambisleep-hypnosis-mcp (PID: 12345)
[MCP-Manager] Starting AI Girlfriend Personality Management (aigf-personality-mcp)...
[MCP-Manager] Started aigf-personality-mcp (PID: 12346)
[MCP-Manager] Starting Hypnotic Trigger Management (trigger-system-mcp)...
[MCP-Manager] Started trigger-system-mcp (PID: 12347)
[MCP-Manager] Starting Chat Analytics & Metrics (chat-analytics-mcp)...
[MCP-Manager] Started chat-analytics-mcp (PID: 12348)
[MCP-Manager] Initialized 4/4 custom MCP servers
```

---

## 🔌 API Integration (Coming Soon)

### Todo: Express Routes for MCP Tools

The following Express routes need to be created to expose MCP tools via HTTP:

1. **Hypnosis Routes** (`src/routes/hypnosis.js`):
   - `POST /api/hypnosis/audio` - Add audio file
   - `GET /api/hypnosis/search` - Search audio library
   - `POST /api/hypnosis/playlist` - Create playlist
   - `GET /api/hypnosis/playlist/:id` - Get playlist
   - `GET /api/hypnosis/triggers` - List triggers

2. **Personality Routes** (`src/routes/personality.js`):
   - `POST /api/personality` - Create personality profile
   - `POST /api/personality/switch` - Switch active personality
   - `PATCH /api/personality/mood` - Update mood state
   - `POST /api/personality/context` - Add conversational context
   - `GET /api/personality/profiles` - List all profiles

3. **Trigger Routes** (`src/routes/triggers.js`):
   - `POST /api/triggers` - Register new trigger
   - `POST /api/triggers/:id/activate` - Activate trigger (requires compliance)
   - `GET /api/triggers/search` - Search triggers
   - `GET /api/triggers/:id` - Get trigger details
   - `GET /api/triggers/:id/history` - Activation history
   - `GET /api/triggers/compliance/stats` - Compliance statistics

4. **Analytics Routes** (`src/routes/analytics.js`):
   - `POST /api/analytics/session/start` - Start user session
   - `POST /api/analytics/session/end` - End session
   - `POST /api/analytics/message` - Record message
   - `POST /api/analytics/conversion` - Record conversion event
   - `GET /api/analytics` - Get analytics summary
   - `GET /api/analytics/user/:id` - User engagement metrics

---

## 📊 Observability Integration

The MCP manager emits events that can be integrated with existing OpenTelemetry/Prometheus metrics:

**EventEmitter Events**:

- `serverStarted` - MCP server successfully started
- `serverFailed` - MCP server failed to start
- `serverError` - Runtime error in MCP server process
- `serverExited` - MCP server process exited
- `serverMaxRetriesExceeded` - Exceeded retry limit

**Future Metrics** (to add to `src/services/telemetry.js`):

```javascript
const mcpServerStatus = new promClient.Gauge({
  name: 'mcp_server_status',
  help: 'MCP server status (1 = running, 0 = stopped)',
  labelNames: ['server_id', 'server_name', 'layer'],
});

const mcpServerRestarts = new promClient.Counter({
  name: 'mcp_server_restarts_total',
  help: 'Total MCP server restarts',
  labelNames: ['server_id', 'reason'],
});
```

---

## 🔐 Security Considerations

### Compliance Enforcement

**trigger-system-mcp** requires explicit compliance acknowledgment:

```javascript
// ❌ WILL THROW ERROR
await callTool('activate_trigger', {
  triggerId: 'trigger-123',
  complianceAcknowledged: false, // Missing or false
});

// ✅ CORRECT
await callTool('activate_trigger', {
  triggerId: 'trigger-123',
  complianceAcknowledged: true, // Required
  userId: 'user-456',
  context: { sessionId: 'session-789' },
});
```

### Process Isolation

Each MCP server runs as an **isolated child process**:

- Separate Node.js runtime
- Independent memory space
- Crash isolation (one server crash doesn't affect others)
- Auto-restart on failure

---

## 🛠️ Troubleshooting

### MCP Server Won't Start

**Symptom**: Server shows `status: 'stopped'` in `/api/mcp/status`

**Solutions**:

1. Check MCP server path is correct (relative from bambisleep-church)
2. Verify Node.js 20+ is installed
3. Run `npm install` in each MCP server directory
4. Check logs: `docker-compose logs -f` or `pm2 logs`
5. Verify `ENABLE_*_MCP=true` in `.env`

### MCP Server Crashes Repeatedly

**Symptom**: Logs show multiple restart attempts

**Solutions**:

1. Check stderr logs for error messages
2. Verify MCP server dependencies are installed
3. Check for port conflicts
4. Ensure adequate system resources (memory, CPU)
5. Review retry count in `mcpManager.maxRetries` (default: 3)

### Graceful Shutdown Hangs

**Symptom**: Server doesn't exit cleanly on SIGTERM

**Solutions**:

1. Check MCP server processes respond to SIGTERM
2. Verify 2-second timeout is sufficient (adjust in `mcp-manager.js`)
3. Use SIGKILL if SIGTERM fails: `pkill -9 node`

---

## 📈 Next Steps

### Immediate (This Session)

- [ ] Copy `src/agent/agent-coordinator.js` from bambisleep-chat-catgirl
- [ ] Add Express API routes for MCP tools
- [ ] Create production deployment infrastructure (docker-compose.prod.yml)
- [ ] Add PostgreSQL persistence for chat-analytics-mcp

### Short-Term (Next Session)

- [ ] Add Prometheus metrics for MCP server health
- [ ] Create Grafana dashboard for MCP monitoring
- [ ] Implement authentication for MCP API endpoints
- [ ] Add rate limiting to MCP routes
- [ ] Write integration tests for MCP manager

### Long-Term

- [ ] Migrate from Express to Next.js for React SSR
- [ ] Add Redis caching for MCP responses
- [ ] Implement MCP tool batching/pipelining
- [ ] Create admin UI for MCP server management
- [ ] Add MCP server version management/updates

---

## 📝 Files Changed

| File                          | Type     | Lines | Description                       |
| ----------------------------- | -------- | ----- | --------------------------------- |
| `src/services/mcp-manager.js` | Created  | 283   | MCP server lifecycle management   |
| `src/server.js`               | Modified | +15   | Import and initialize MCP manager |
| `.env.example`                | Modified | +13   | Custom MCP server configuration   |
| `PRODUCTION_UPGRADE.md`       | Created  | 350+  | This document                     |

**Total**: 1 new service, 3 modified files, 650+ lines of new code

---

## 🌸 Success Criteria

✅ **Phase 1 Complete** when:

- [x] 4 custom MCP servers start automatically with Express server
- [x] `/api/mcp/status` endpoint returns server health
- [x] Graceful shutdown stops all MCP servers
- [x] Automatic restart on MCP server crashes
- [x] Documented configuration in `.env.example`

🚧 **Phase 2 In Progress**:

- [ ] Express API routes expose MCP tools
- [ ] Commander-Brandynette agent authority integrated
- [ ] Production deployment infrastructure ready
- [ ] PostgreSQL persistence for analytics

---

**Part of the BambiSleep™ CATHEDRAL Project** | [GitHub](https://github.com/BambiSleepChat)
