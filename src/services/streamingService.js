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
      
      // 연결 시 분석 이벤트 리스너 등록
      this.socket.on('analysis', (data) => {
        console.log('[WebSocket] Received analysis data:', data);
        if (this.onAnalysisCallback) {
          this.onAnalysisCallback(data);
        }
      });

      // 에러 이벤트 리스너
      this.socket.on('error', (error) => {
        console.error('[WebSocket] Error:', error);
        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        }
      });
    });
    
    // 재연결 시 이벤트 리스너 재등록
    const setupAnalysisListener = () => {
      if (this.socket) {
        // 기존 리스너 제거
        this.socket.off('analysis');
        // 새로운 리스너 등록
        if (this.onAnalysisCallback) {
          this.socket.on('analysis', this.onAnalysisCallback);
        }
      }
    };
    
    // 초기 연결 시 리스너 설정
    setupAnalysisListener();
    
    // 재연결 시에도 리스너 다시 설정
    this.socket.on('reconnect', setupAnalysisListener);

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

  initialize(sessionId, examId, userId) {
    this.sessionId = sessionId;
    this.examId = examId;
    this.userId = userId;

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
      query: { sessionId, examId },
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

    const meta = {
      sessionId: this.sessionId,
      examId:    this.examId,
      timestamp: Date.now(),
      userId:    this.userId,
    };
  
    try {
      if (frameData instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const buffer = reader.result;
          this.socket.emit('frame', { meta, buffer }, (ack) => {
            console.log('[StreamingService] Ack:', ack);
          });
        };
        reader.readAsArrayBuffer(frameData);
  
      } else {
        this.socket.emit('frame', { meta, buffer: frameData }, (ack) => {
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
    console.log('[WebSocket] Analysis callback registered');
    
    // 기존 콜백 제거
    if (this.socket) {
      this.socket.off('analysis');
    }
    
    // 새로운 콜백 설정
    this.onAnalysisCallback = (data) => {
      console.log('[WebSocket] Analysis data received in onAnalysis:', data);
      cb(data);
    };
    
    // 이미 소켓이 연결된 상태라면 즉시 이벤트 리스너 등록
    if (this.socket) {
      this.socket.on('analysis', this.onAnalysisCallback);
    }
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
