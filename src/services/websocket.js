/**
 * WebSocket server for real-time features
 * Handles live updates, avatar interactions, notifications
 */

import jwt from 'jsonwebtoken';
import {
  logger,
  trackAuthAttempt,
  trackSecurityEvent,
  websocketConnectionsTotal,
  websocketConnectionsActive,
  websocketMessagesTotal,
} from './telemetry.js';

const clients = new Map();

export function setupWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const clientId = generateClientId();

    // Track connection metrics
    websocketConnectionsTotal.inc();
    websocketConnectionsActive.inc();

    logger.info('WebSocket connection established', {
      clientId: clientId,
      ip: req.socket.remoteAddress,
    });

    // Store client
    clients.set(clientId, {
      ws,
      id: clientId,
      connectedAt: new Date().toISOString(),
      authenticated: false,
      userId: null,
    });

    // Send welcome message
    ws.send(
      JSON.stringify({
        type: 'welcome',
        clientId,
        message: 'Welcome to the BambiSleep Church Sanctuary',
        timestamp: new Date().toISOString(),
      })
    );

    // Handle incoming messages
    ws.on('message', message => {
      try {
        const data = JSON.parse(message);
        websocketMessagesTotal.inc({
          direction: 'inbound',
          message_type: data.type || 'unknown',
        });
        handleMessage(clientId, data);
      } catch (error) {
        logger.error('WebSocket message error', {
          error: error.message,
          clientId: clientId,
        });
        trackSecurityEvent('websocket_invalid_message', 'low', {
          clientId: clientId,
          error: error.message,
        });
        ws.send(
          JSON.stringify({
            type: 'error',
            error: 'Invalid message format',
          })
        );
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      websocketConnectionsActive.dec();
      logger.info('WebSocket disconnected', {
        clientId: clientId,
        duration:
          Date.now() - new Date(clients.get(clientId)?.connectedAt).getTime(),
      });
      clients.delete(clientId);
    });

    // Handle errors
    ws.on('error', error => {
      logger.error('WebSocket error', {
        clientId: clientId,
        error: error.message,
        stack: error.stack,
      });
    });

    // Ping/pong for keepalive
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  });

  // Keepalive interval
  const interval = setInterval(() => {
    wss.clients.forEach(ws => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000); // 30 seconds

  wss.on('close', () => {
    clearInterval(interval);
  });

  logger.info('WebSocket server initialized');
}

/**
 * Handle incoming WebSocket messages
 */
function handleMessage(clientId, data) {
  const client = clients.get(clientId);
  if (!client) return;

  const { ws } = client;

  switch (data.type) {
    case 'auth':
      // Authenticate client with JWT token
      handleAuth(clientId, data.token);
      break;

    case 'ping':
      ws.send(
        JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString(),
        })
      );
      break;

    case 'avatar_action':
      // Handle avatar interactions
      handleAvatarAction(clientId, data.action);
      break;

    case 'chat':
      // Broadcast chat message to all authenticated clients
      broadcastToAuthenticated({
        type: 'chat',
        from: client.userId || 'anonymous',
        message: data.message,
        timestamp: new Date().toISOString(),
      });
      break;

    case 'subscribe_room':
      // Subscribe to specific room/channel
      handleRoomSubscription(clientId, data.room);
      break;

    default:
      ws.send(
        JSON.stringify({
          type: 'error',
          error: 'Unknown message type',
        })
      );
  }
}

/**
 * Authenticate WebSocket client
 */
function handleAuth(clientId, token) {
  const client = clients.get(clientId);
  if (!client) return;

  try {
    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'change-this-secret'
    );

    client.authenticated = true;
    client.userId = decoded.id || decoded.userId;

    trackAuthAttempt('websocket', 'success', client.userId);
    logger.info('WebSocket authenticated', {
      clientId: clientId,
      userId: client.userId,
    });

    client.ws.send(
      JSON.stringify({
        type: 'auth_success',
        message: 'Authentication successful',
        userId: client.userId,
      })
    );

    websocketMessagesTotal.inc({
      direction: 'outbound',
      message_type: 'auth_success',
    });
  } catch (error) {
    trackAuthAttempt('websocket', 'failed', null);
    trackSecurityEvent('websocket_auth_failure', 'medium', {
      clientId: clientId,
      error: error.message,
    });
    logger.error('WebSocket auth error', {
      clientId: clientId,
      error: error.message,
    });

    client.ws.send(
      JSON.stringify({
        type: 'auth_failed',
        error: 'Invalid authentication token',
      })
    );

    websocketMessagesTotal.inc({
      direction: 'outbound',
      message_type: 'auth_failed',
    });
  }
}

/**
 * Handle avatar actions
 */
function handleAvatarAction(clientId, action) {
  const client = clients.get(clientId);
  if (!client || !client.authenticated) {
    client.ws.send(
      JSON.stringify({
        type: 'error',
        error: 'Authentication required for avatar actions',
      })
    );
    return;
  }

  // Broadcast avatar action to other clients in the same room
  broadcastToAuthenticated({
    type: 'avatar_update',
    userId: client.userId,
    action,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Handle room subscription
 */
function handleRoomSubscription(clientId, room) {
  const client = clients.get(clientId);
  if (!client) return;

  client.room = room;

  client.ws.send(
    JSON.stringify({
      type: 'room_joined',
      room,
      message: `Joined room: ${room}`,
    })
  );
}

/**
 * Broadcast message to all authenticated clients
 */
function broadcastToAuthenticated(message) {
  const messageStr = JSON.stringify(message);

  clients.forEach(client => {
    if (client.authenticated && client.ws.readyState === 1) {
      client.ws.send(messageStr);
      websocketMessagesTotal.inc({
        direction: 'outbound',
        message_type: message.type || 'broadcast',
      });
    }
  });
}

/**
 * Broadcast message to specific room
 */
export function broadcastToRoom(room, message) {
  const messageStr = JSON.stringify(message);

  clients.forEach(client => {
    if (client.room === room && client.ws.readyState === 1) {
      client.ws.send(messageStr);
    }
  });
}

/**
 * Send message to specific client
 */
export function sendToClient(clientId, message) {
  const client = clients.get(clientId);
  if (client && client.ws.readyState === 1) {
    client.ws.send(JSON.stringify(message));
  }
}

/**
 * Generate unique client ID
 */
function generateClientId() {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all connected clients count
 */
export function getConnectionCount() {
  return clients.size;
}

/**
 * Get authenticated clients count
 */
export function getAuthenticatedCount() {
  let count = 0;
  clients.forEach(client => {
    if (client.authenticated) count++;
  });
  return count;
}
