import { io } from 'socket.io-client';
import { isCriticalEvent, normalizePayload } from './utils';

const DEFAULT_RETRY_POLICY = {
  attempts: 3,
  delaysMs: [500, 1000, 2000],
  ackTimeoutMs: 8000,
};

export class SocketIoAdapter {
  constructor({ url, token, path = '/socket.io', onConnectionChange, onError }) {
    this.url = url;
    this.token = token;
    this.path = path;
    this.onConnectionChange = onConnectionChange;
    this.onError = onError;
    this.socket = null;
    this.connected = false;
    this.joinedMatchId = null;
    this.listeners = new Map();
    this.seenMessages = new Map();
  }

  connect() {
    if (this.socket) return;

    this.socket = io(this.url, {
      autoConnect: false,
      path: this.path,
      transports: ['websocket', 'polling'],
      auth: this.token ? { token: this.token } : undefined,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', async () => {
      this.connected = true;
      this.onConnectionChange?.(true);
      if (this.joinedMatchId) {
        try {
          await this.joinMatch(this.joinedMatchId);
        } catch (error) {
          this.onError?.(error);
        }
      }
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      this.onConnectionChange?.(false);
    });

    this.socket.on('connect_error', (error) => {
      this.onError?.(error);
    });

    this.socket.onAny((eventName, payload) => {
      const normalized = normalizePayload(payload);
      if (!this.shouldAcceptMessage(eventName, normalized)) return;
      this.dispatchEvent(eventName, normalized);
    });

    this.socket.connect();
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }
    this.socket = null;
    this.connected = false;
    this.onConnectionChange?.(false);
  }

  on(eventName, handler) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(handler);
  }

  off(eventName, handler) {
    const handlers = this.listeners.get(eventName);
    if (!handlers) return;
    handlers.delete(handler);
    if (handlers.size === 0) {
      this.listeners.delete(eventName);
    }
  }

  dispatchEvent(eventName, payload) {
    const eventHandlers = this.listeners.get(eventName) || new Set();
    const wildcardHandlers = this.listeners.get('*') || new Set();
    eventHandlers.forEach((handler) => handler(payload, eventName));
    wildcardHandlers.forEach((handler) => handler(payload, eventName));
  }

  shouldAcceptMessage(eventName, payload) {
    const sequence = payload?.meta?.sequence;
    const requestId = payload?.meta?.requestId;
    const dedupeKey = sequence !== undefined ? `${eventName}:seq:${sequence}` : requestId ? `${eventName}:req:${requestId}` : null;
    if (!dedupeKey) return true;

    const now = Date.now();
    const previousTs = this.seenMessages.get(dedupeKey);
    this.seenMessages.set(dedupeKey, now);

    if (this.seenMessages.size > 1000) {
      const cutoff = now - 5 * 60 * 1000;
      for (const [key, ts] of this.seenMessages.entries()) {
        if (ts < cutoff) this.seenMessages.delete(key);
      }
    }

    return previousTs === undefined;
  }

  async emit(eventName, payload, options = {}) {
    if (!this.socket || !this.connected) {
      return { ok: false, code: 'NOT_CONNECTED', message: 'Socket is not connected' };
    }

    const retryPolicy = {
      ...DEFAULT_RETRY_POLICY,
      ...(options.retryPolicy || {}),
    };
    const requiresAck = Boolean(options.ack || options.critical || isCriticalEvent(eventName));
    const message = normalizePayload(payload);

    if (!requiresAck) {
      this.socket.emit(eventName, message);
      return { ok: true };
    }

    let lastError = null;
    for (let attempt = 0; attempt < retryPolicy.attempts; attempt += 1) {
      const delay = retryPolicy.delaysMs[attempt] ?? retryPolicy.delaysMs[retryPolicy.delaysMs.length - 1] ?? 0;
      if (attempt > 0 && delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      try {
        const response = await this.emitWithAck(eventName, message, retryPolicy.ackTimeoutMs);
        if (response?.ok === false) {
          lastError = response;
          continue;
        }
        return response || { ok: true };
      } catch (error) {
        lastError = {
          ok: false,
          code: 'ACK_TIMEOUT',
          message: error?.message || 'No acknowledgement received',
        };
      }
    }

    return lastError || {
      ok: false,
      code: 'UNKNOWN_ACK_ERROR',
      message: 'Failed to receive acknowledgement',
    };
  }

  emitWithAck(eventName, payload, timeoutMs) {
    return new Promise((resolve, reject) => {
      this.socket.timeout(timeoutMs).emit(eventName, payload, (err, response) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(response);
      });
    });
  }

  joinMatch(matchId) {
    // The current backend broadcasts by explicit `/topic/.../{matchId}` events
    // and does not require or expose a Socket.IO room join API.
    this.joinedMatchId = matchId;
    return Promise.resolve({ ok: true });
  }

  leaveMatch(matchId) {
    const targetMatchId = matchId || this.joinedMatchId;
    if (!targetMatchId) return Promise.resolve({ ok: true });
    if (String(this.joinedMatchId) === String(targetMatchId)) {
      this.joinedMatchId = null;
    }
    return Promise.resolve({ ok: true });
  }
}
