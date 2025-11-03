/// Law: Custom MCP Server Manager for BambiSleep™ Church
/// SPDX-License-Identifier: MIT

import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from './telemetry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//<3 Lore: Manages 4 custom MCP servers from bambisleep-chat-catgirl
//<3 Coordinates with Commander-Brandynette agent authority system

/// Law: MCP Server Ring Layers
const MCPRingLayer = {
  LAYER_0: 0, // Primitives: filesystem, memory
  LAYER_1: 1, // Foundation: git, github, brave-search
  LAYER_2: 2, // Advanced: custom MCP servers (hypnosis, personality, triggers, analytics)
};

/// Law: Custom MCP Server configurations
const CUSTOM_MCP_SERVERS = {
  'bambisleep-hypnosis-mcp': {
    name: 'BambiSleep™ Hypnosis Audio Management',
    layer: MCPRingLayer.LAYER_2,
    path: process.env.HYPNOSIS_MCP_PATH || join(__dirname, '..', '..', '..', 'bambisleep-chat-catgirl', 'mcp-servers', 'bambisleep-hypnosis-mcp', 'index.js'),
    enabled: process.env.ENABLE_HYPNOSIS_MCP !== 'false',
    tools: ['add_audio_file', 'search_audio', 'create_playlist', 'get_playlist', 'list_triggers'],
    resources: ['bambisleep://audio/library', 'bambisleep://playlists/{id}'],
  },
  'aigf-personality-mcp': {
    name: 'AI Girlfriend Personality Management',
    layer: MCPRingLayer.LAYER_2,
    path: process.env.PERSONALITY_MCP_PATH || join(__dirname, '..', '..', '..', 'bambisleep-chat-catgirl', 'mcp-servers', 'aigf-personality-mcp', 'index.js'),
    enabled: process.env.ENABLE_PERSONALITY_MCP !== 'false',
    tools: ['create_personality', 'switch_personality', 'update_mood', 'add_context', 'get_trigger_response', 'list_profiles'],
    resources: ['aigf://profile/active', 'aigf://profiles/{id}'],
    prompts: ['personality_greeting', 'personality_response'],
  },
  'trigger-system-mcp': {
    name: 'Hypnotic Trigger Management',
    layer: MCPRingLayer.LAYER_2,
    path: process.env.TRIGGER_SYSTEM_MCP_PATH || join(__dirname, '..', '..', '..', 'bambisleep-chat-catgirl', 'mcp-servers', 'trigger-system-mcp', 'index.js'),
    enabled: process.env.ENABLE_TRIGGER_SYSTEM_MCP !== 'false',
    tools: ['register_trigger', 'activate_trigger', 'search_triggers', 'get_trigger', 'get_activation_history', 'get_compliance_stats'],
    resources: ['triggers://registry', 'triggers://logs', 'triggers://compliance'],
  },
  'chat-analytics-mcp': {
    name: 'Chat Analytics & Metrics',
    layer: MCPRingLayer.LAYER_2,
    path: process.env.ANALYTICS_MCP_PATH || join(__dirname, '..', '..', '..', 'bambisleep-chat-catgirl', 'mcp-servers', 'chat-analytics-mcp', 'index.js'),
    enabled: process.env.ENABLE_ANALYTICS_MCP !== 'false',
    tools: ['start_session', 'end_session', 'record_message', 'record_trigger_activation', 'record_conversion', 'get_analytics', 'get_user_engagement'],
    resources: ['analytics://sessions/active', 'analytics://sessions/completed', 'analytics://users/engagement', 'analytics://conversions', 'analytics://summary'],
  },
};

//!? Guardrail: MCP server processes require proper lifecycle management
//!? Always clean up child processes on server shutdown

/// Law: MCP Server Manager with EventEmitter
class MCPServerManager extends EventEmitter {
  constructor() {
    super();
    this.servers = new Map();
    this.processes = new Map();
    this.connectionAttempts = new Map();
    this.maxRetries = 3;
  }

  /**
   * Initialize all enabled custom MCP servers
   * @returns {Promise<void>}
   */
  async initialize() {
    logger.info('[MCP-Manager] Initializing custom MCP servers...');

    for (const [serverId, config] of Object.entries(CUSTOM_MCP_SERVERS)) {
      if (!config.enabled) {
        logger.info(`[MCP-Manager] Skipping disabled server: ${serverId}`);
        continue;
      }

      try {
        await this.startServer(serverId, config);
        this.emit('serverStarted', { serverId, config });
      } catch (error) {
        logger.error(`[MCP-Manager] Failed to start ${serverId}:`, error);
        this.emit('serverFailed', { serverId, error });
      }
    }

    logger.info(`[MCP-Manager] Initialized ${this.servers.size}/${Object.keys(CUSTOM_MCP_SERVERS).filter(k => CUSTOM_MCP_SERVERS[k].enabled).length} custom MCP servers`);
  }

  /**
   * Start individual MCP server
   * @param {string} serverId - Server identifier
   * @param {object} config - Server configuration
   * @returns {Promise<void>}
   */
  async startServer(serverId, config) {
    logger.info(`[MCP-Manager] Starting ${config.name} (${serverId})...`);

    // Spawn Node.js process for MCP server
    const process = spawn('node', [config.path], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'production',
      },
    });

    // Handle process output
    process.stdout.on('data', (data) => {
      logger.debug(`[${serverId}] stdout: ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
      const message = data.toString().trim();
      // Filter out INFO/DEBUG logs from MCP servers
      if (message.includes('[AIGF-MCP]') || message.includes('[TRIGGER-MCP]') || message.includes('[ANALYTICS-MCP]')) {
        logger.debug(`[${serverId}] ${message}`);
      } else {
        logger.error(`[${serverId}] stderr: ${message}`);
      }
    });

    process.on('error', (error) => {
      logger.error(`[${serverId}] Process error:`, error);
      this.emit('serverError', { serverId, error });
      this.handleServerFailure(serverId, config);
    });

    process.on('exit', (code, signal) => {
      logger.warn(`[${serverId}] Process exited with code ${code}, signal ${signal}`);
      this.processes.delete(serverId);
      this.servers.delete(serverId);
      this.emit('serverExited', { serverId, code, signal });

      if (code !== 0 && code !== null) {
        this.handleServerFailure(serverId, config);
      }
    });

    // Store process and metadata
    this.processes.set(serverId, process);
    this.servers.set(serverId, {
      config,
      pid: process.pid,
      startTime: new Date().toISOString(),
      status: 'running',
    });

    logger.info(`[MCP-Manager] Started ${serverId} (PID: ${process.pid})`);
  }

  /**
   * Handle server failure with retry logic
   * @private
   */
  handleServerFailure(serverId, config) {
    const attempts = this.connectionAttempts.get(serverId) || 0;

    if (attempts < this.maxRetries) {
      this.connectionAttempts.set(serverId, attempts + 1);
      logger.warn(`[MCP-Manager] Retrying ${serverId} (attempt ${attempts + 1}/${this.maxRetries})...`);

      setTimeout(() => {
        this.startServer(serverId, config).catch((error) => {
          logger.error(`[MCP-Manager] Retry failed for ${serverId}:`, error);
        });
      }, 5000 * (attempts + 1)); // Exponential backoff
    } else {
      logger.error(`[MCP-Manager] Max retries exceeded for ${serverId}`);
      this.emit('serverMaxRetriesExceeded', { serverId });
    }
  }

  /**
   * Get status of all MCP servers
   * @returns {Array} Server status array
   */
  getServerStatus() {
    const status = [];

    for (const [serverId, config] of Object.entries(CUSTOM_MCP_SERVERS)) {
      const serverData = this.servers.get(serverId);

      status.push({
        id: serverId,
        name: config.name,
        layer: config.layer,
        enabled: config.enabled,
        status: serverData ? serverData.status : 'stopped',
        pid: serverData ? serverData.pid : null,
        startTime: serverData ? serverData.startTime : null,
        tools: config.tools.length,
        resources: config.resources.length,
      });
    }

    return status;
  }

  /**
   * Get server by ID
   * @param {string} serverId - Server identifier
   * @returns {object|null} Server metadata
   */
  getServer(serverId) {
    return this.servers.get(serverId);
  }

  /**
   * Stop specific server
   * @param {string} serverId - Server identifier
   */
  stopServer(serverId) {
    const process = this.processes.get(serverId);
    if (process) {
      logger.info(`[MCP-Manager] Stopping ${serverId} (PID: ${process.pid})...`);
      process.kill('SIGTERM');
    }
  }

  /**
   * Shutdown all MCP servers
   * @returns {Promise<void>}
   */
  async shutdown() {
    logger.info('[MCP-Manager] Shutting down all custom MCP servers...');

    for (const [serverId, process] of this.processes.entries()) {
      logger.info(`[MCP-Manager] Stopping ${serverId} (PID: ${process.pid})...`);
      process.kill('SIGTERM');
    }

    // Wait for graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Force kill any remaining processes
    for (const [serverId, process] of this.processes.entries()) {
      if (!process.killed) {
        logger.warn(`[MCP-Manager] Force killing ${serverId}`);
        process.kill('SIGKILL');
      }
    }

    this.processes.clear();
    this.servers.clear();
    logger.info('[MCP-Manager] All MCP servers shut down');
  }
}

//-> Strategy: Export manager instance and constants
const mcpManager = new MCPServerManager();

export {
  mcpManager,
  MCPServerManager,
  MCPRingLayer,
  CUSTOM_MCP_SERVERS,
};
