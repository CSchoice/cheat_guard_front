// src/services/streamingService.js
import { io } from 'socket.io-client';
import { getToken } from '../utils/auth';

class StreamingService {
  constructor() {
    this.socket = null;
    this.sessionId = null;
    this.pingInterval = null;
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[WebSocket] ✅ Connected to server with ID:', this.socket.id);
      console.log('[WebSocket] Session ID:', this.sessionId);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] ❌ Connection Error:', error.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] 🔌 Disconnected:', reason);
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('[WebSocket] ⚠️ Error:', error);
    });

    this.socket.on('pong', (latency) => {
      console.log(`[WebSocket] 🏓 Pong! Latency: ${latency}ms`);
    });

    this.pingInterval = setInterval(() => {
      if (this.socket.connected) {
        const start = Date.now();
        this.socket.emit('ping', () => {
          const latency = Date.now() - start;
          console.log(`[WebSocket] Ping: ${latency}ms`);
          this.socket.emit('pong', latency);
        });
      }
    }, 10000);
  }

  initialize(sessionId) {
    this.sessionId = sessionId;

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    const serverUrl = 'http://localhost:5000';
    const namespace = 'api/stream';
    const connectionUrl = `${serverUrl}/${namespace}`; 
    const token = getToken();

    console.log('[StreamingService] Connecting to:', connectionUrl);
    console.log('[StreamingService] Using token:', token ? 'O' : 'X');

    const options = {
      path: '/api/socket.io',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      forceNew: true,
      auth: { token },
      query: { sessionId },
      upgrade: false,
      withCredentials: true,
    };

    this.socket = io(connectionUrl, options);
    this.setupEventListeners();
  }

  sendFrame(frameData) {
    if (!this.socket || !this.socket.connected) {
      console.warn('[StreamingService] Socket not connected');
      return false;
    }

    const size = frameData.byteLength ?? frameData.size ?? 0;
    console.log(`[StreamingService] 📤 Sending frame (${size} bytes)`);

    try {
      if (frameData instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const buffer = reader.result;
          this.socket.emit('frame', buffer, (ack) => {
            console.log('[StreamingService] Ack:', ack);
          });
        };
        reader.readAsArrayBuffer(frameData);
      } else {
        this.socket.emit('frame', frameData, (ack) => {
          console.log('[StreamingService] Ack:', ack);
        });
      }
      return true;
    } catch (err) {
      console.error('[StreamingService] Error sending frame:', err);
      return false;
    }
  }

  onAnalysis(cb) {
    if (!this.socket) return;
    this.socket.on('analysis', cb);
  }

  onError(cb) {
    if (!this.socket) return;
    this.socket.on('error', cb);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.sessionId = null;
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }
    }
  }
}

const streamingService = new StreamingService();
export default streamingService;
