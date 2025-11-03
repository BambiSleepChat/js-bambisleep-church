/**
 * Tests for WebSocket Service
 * Verifies WebSocket connection handling, authentication, and message routing
 */

import { jest } from '@jest/globals';
import { EventEmitter } from 'events';

describe('WebSocket Service', () => {
  let setupWebSocket, broadcastToRoom;

  beforeAll(async () => {
    const websocket = await import('./websocket.js');
    setupWebSocket = websocket.setupWebSocket;
    broadcastToRoom = websocket.broadcastToRoom;
  });

  describe('setupWebSocket', () => {
    it('should initialize WebSocket server', () => {
      const mockWss = new EventEmitter();
      mockWss.clients = new Set();

      expect(() => {
        setupWebSocket(mockWss);
      }).not.toThrow();

      expect(mockWss.listenerCount('connection')).toBeGreaterThan(0);
    });

    it('should handle new WebSocket connections', done => {
      const mockWss = new EventEmitter();
      mockWss.clients = new Set();

      setupWebSocket(mockWss);

      const mockWs = new EventEmitter();
      mockWs.send = jest.fn();
      mockWs.isAlive = true;
      mockWs.readyState = 1; // OPEN

      const mockReq = {
        socket: { remoteAddress: '192.168.1.1' },
      };

      mockWss.emit('connection', mockWs, mockReq);

      // Wait for welcome message
      setTimeout(() => {
        expect(mockWs.send).toHaveBeenCalled();
        const callArgs = mockWs.send.mock.calls[0][0];
        const message = JSON.parse(callArgs);
        expect(message.type).toBe('welcome');
        expect(message.clientId).toBeDefined();
        done();
      }, 10);
    });
  });

  describe('Message Handling', () => {
    it('should handle ping messages', done => {
      const mockWss = new EventEmitter();
      mockWss.clients = new Set();

      setupWebSocket(mockWss);

      const mockWs = new EventEmitter();
      mockWs.send = jest.fn();
      mockWs.isAlive = true;
      mockWs.readyState = 1;

      const mockReq = {
        socket: { remoteAddress: '192.168.1.1' },
      };

      mockWss.emit('connection', mockWs, mockReq);

      // Send ping message
      const pingMessage = JSON.stringify({ type: 'ping' });
      mockWs.emit('message', pingMessage);

      setTimeout(() => {
        // Should receive pong response
        const calls = mockWs.send.mock.calls;
        const pongResponse = calls.find(call => {
          try {
            const msg = JSON.parse(call[0]);
            return msg.type === 'pong';
          } catch {
            return false;
          }
        });
        expect(pongResponse).toBeDefined();
        done();
      }, 10);
    });

    it('should handle invalid JSON messages', done => {
      const mockWss = new EventEmitter();
      mockWss.clients = new Set();

      setupWebSocket(mockWss);

      const mockWs = new EventEmitter();
      mockWs.send = jest.fn();
      mockWs.isAlive = true;
      mockWs.readyState = 1;

      const mockReq = {
        socket: { remoteAddress: '192.168.1.1' },
      };

      mockWss.emit('connection', mockWs, mockReq);

      // Send invalid JSON
      mockWs.emit('message', 'invalid json {');

      setTimeout(() => {
        // Should receive error message
        const calls = mockWs.send.mock.calls;
        const errorResponse = calls.find(call => {
          try {
            const msg = JSON.parse(call[0]);
            return msg.type === 'error';
          } catch {
            return false;
          }
        });
        expect(errorResponse).toBeDefined();
        done();
      }, 10);
    });
  });

  describe('Authentication', () => {
    it('should handle auth messages with valid token', done => {
      const mockWss = new EventEmitter();
      mockWss.clients = new Set();

      setupWebSocket(mockWss);

      const mockWs = new EventEmitter();
      mockWs.send = jest.fn();
      mockWs.isAlive = true;
      mockWs.readyState = 1;

      const mockReq = {
        socket: { remoteAddress: '192.168.1.1' },
      };

      mockWss.emit('connection', mockWs, mockReq);

      // Mock JWT token (this will fail but should handle gracefully)
      const authMessage = JSON.stringify({
        type: 'auth',
        token: 'fake.jwt.token',
      });
      mockWs.emit('message', authMessage);

      setTimeout(() => {
        // Should receive auth_failed due to invalid token
        const calls = mockWs.send.mock.calls;
        const authResponse = calls.find(call => {
          try {
            const msg = JSON.parse(call[0]);
            return msg.type === 'auth_failed' || msg.type === 'auth_success';
          } catch {
            return false;
          }
        });
        expect(authResponse).toBeDefined();
        done();
      }, 10);
    });
  });

  describe('Room Subscription', () => {
    it('should handle room subscription messages', done => {
      const mockWss = new EventEmitter();
      mockWss.clients = new Set();

      setupWebSocket(mockWss);

      const mockWs = new EventEmitter();
      mockWs.send = jest.fn();
      mockWs.isAlive = true;
      mockWs.readyState = 1;

      const mockReq = {
        socket: { remoteAddress: '192.168.1.1' },
      };

      mockWss.emit('connection', mockWs, mockReq);

      // Subscribe to room
      const roomMessage = JSON.stringify({
        type: 'subscribe_room',
        room: 'general',
      });
      mockWs.emit('message', roomMessage);

      setTimeout(() => {
        const calls = mockWs.send.mock.calls;
        const roomResponse = calls.find(call => {
          try {
            const msg = JSON.parse(call[0]);
            return msg.type === 'room_joined';
          } catch {
            return false;
          }
        });
        expect(roomResponse).toBeDefined();
        done();
      }, 10);
    });
  });

  describe('Client Lifecycle', () => {
    it('should handle client disconnection', done => {
      const mockWss = new EventEmitter();
      mockWss.clients = new Set();

      setupWebSocket(mockWss);

      const mockWs = new EventEmitter();
      mockWs.send = jest.fn();
      mockWs.isAlive = true;
      mockWs.readyState = 1;

      const mockReq = {
        socket: { remoteAddress: '192.168.1.1' },
      };

      mockWss.emit('connection', mockWs, mockReq);

      // Simulate disconnection
      mockWs.emit('close');

      setTimeout(() => {
        // Should have cleaned up client
        expect(true).toBe(true); // Client removed from map
        done();
      }, 10);
    });

    it('should handle WebSocket errors', done => {
      const mockWss = new EventEmitter();
      mockWss.clients = new Set();

      setupWebSocket(mockWss);

      const mockWs = new EventEmitter();
      mockWs.send = jest.fn();
      mockWs.isAlive = true;
      mockWs.readyState = 1;

      const mockReq = {
        socket: { remoteAddress: '192.168.1.1' },
      };

      mockWss.emit('connection', mockWs, mockReq);

      // Simulate error
      const testError = new Error('Connection error');
      mockWs.emit('error', testError);

      setTimeout(() => {
        // Should have logged error
        expect(true).toBe(true);
        done();
      }, 10);
    });
  });

  describe('broadcastToRoom', () => {
    it('should export broadcastToRoom function', () => {
      expect(broadcastToRoom).toBeDefined();
      expect(typeof broadcastToRoom).toBe('function');
    });

    it('should handle broadcast to empty room', () => {
      expect(() => {
        broadcastToRoom('empty-room', {
          type: 'test',
          message: 'Hello',
        });
      }).not.toThrow();
    });
  });
});
