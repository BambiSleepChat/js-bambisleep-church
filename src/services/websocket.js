/**
 * WebSocket server for real-time features
 * Handles live updates, avatar interactions, notifications
 */

const clients = new Map();

export function setupWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const clientId = generateClientId();
    
    console.log(`👤 New WebSocket connection: ${clientId}`);
    
    // Store client
    clients.set(clientId, {
      ws,
      id: clientId,
      connectedAt: new Date().toISOString(),
      authenticated: false,
      userId: null
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'welcome',
      clientId,
      message: 'Welcome to the BambiSleep Church Sanctuary',
      timestamp: new Date().toISOString()
    }));

    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleMessage(clientId, data);
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Invalid message format'
        }));
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      console.log(`👤 WebSocket disconnected: ${clientId}`);
      clients.delete(clientId);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for ${clientId}:`, error);
    });

    // Ping/pong for keepalive
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  });

  // Keepalive interval
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
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

  console.log('✅ WebSocket server initialized');
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
      ws.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString()
      }));
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
        timestamp: new Date().toISOString()
      });
      break;

    case 'subscribe_room':
      // Subscribe to specific room/channel
      handleRoomSubscription(clientId, data.room);
      break;

    default:
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Unknown message type'
      }));
  }
}

/**
 * Authenticate WebSocket client
 */
function handleAuth(clientId, token) {
  const client = clients.get(clientId);
  if (!client) return;

  try {
    // TODO: Verify JWT token
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    client.authenticated = true;
    client.userId = 'user_123'; // Replace with actual user ID from token

    client.ws.send(JSON.stringify({
      type: 'auth_success',
      message: 'Authentication successful'
    }));
  } catch (error) {
    client.ws.send(JSON.stringify({
      type: 'auth_failed',
      error: 'Invalid authentication token'
    }));
  }
}

/**
 * Handle avatar actions
 */
function handleAvatarAction(clientId, action) {
  const client = clients.get(clientId);
  if (!client || !client.authenticated) {
    client.ws.send(JSON.stringify({
      type: 'error',
      error: 'Authentication required for avatar actions'
    }));
    return;
  }

  // Broadcast avatar action to other clients in the same room
  broadcastToAuthenticated({
    type: 'avatar_update',
    userId: client.userId,
    action,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle room subscription
 */
function handleRoomSubscription(clientId, room) {
  const client = clients.get(clientId);
  if (!client) return;

  client.room = room;
  
  client.ws.send(JSON.stringify({
    type: 'room_joined',
    room,
    message: `Joined room: ${room}`
  }));
}

/**
 * Broadcast message to all authenticated clients
 */
function broadcastToAuthenticated(message) {
  const messageStr = JSON.stringify(message);
  
  clients.forEach((client) => {
    if (client.authenticated && client.ws.readyState === 1) {
      client.ws.send(messageStr);
    }
  });
}

/**
 * Broadcast message to specific room
 */
export function broadcastToRoom(room, message) {
  const messageStr = JSON.stringify(message);
  
  clients.forEach((client) => {
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
  clients.forEach((client) => {
    if (client.authenticated) count++;
  });
  return count;
}
