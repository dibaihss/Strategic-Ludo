
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { Platform } from 'react-native';
import { applyServerStateSnapshot } from '../store/gameSlice.jsx';

// ─── WebSocket URL Configuration ──────────────────────────────────────────
const PRODUCTION_WS_URL = process.env.EXPO_PUBLIC_WS_URL;
const LOCALHOST_WS_URL  = process.env.EXPO_PUBLIC_LOCALHOST_WS_URL;
const ANDROID_WS_URL    = 'http://192.168.178.130:3000';

let WEBSOCKET_URL;
if (__DEV__) {
  WEBSOCKET_URL = Platform.OS === 'android' ? ANDROID_WS_URL : LOCALHOST_WS_URL;
} else {
  WEBSOCKET_URL = PRODUCTION_WS_URL;
}
// ──────────────────────────────────────────────────────────────────────────

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {

  const dispatch    = useDispatch();
  const isOnline    = useSelector(state => state.game.isOnline);
  const currentMatch = useSelector(state => state.session.currentMatch);
  const user        = useSelector(state => state.auth.user);

  // ✅ useRef instead of useState — no stale closures
  const socketRef   = useRef(null);
  const [connected, setConnected] = useState(false);

  // ─── Keep latest values in refs so callbacks never go stale ───────────
  const userRef         = useRef(user);
  const currentMatchRef = useRef(currentMatch);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { currentMatchRef.current = currentMatch; }, [currentMatch]);

  // ─── Register user on server ───────────────────────────────────────────
  const registerUser = useCallback((client) => {
    const u = userRef.current;
    const m = currentMatchRef.current;
    if (!u?.name) return;

    client.emit('chat.addUser', {
      sender:    u.name,
      userId:    u.id,
      sessionId: m?.id ?? null,
    }, (response) => {
      // ✅ Acknowledgement — know if registration succeeded
      if (response?.status === 'ok') {
        console.log('User registered on server:', response.user);
      } else {
        console.warn('User registration failed:', response?.reason);
      }
    });
  }, []);

  // ─── Emit with acknowledgement + timeout ──────────────────────────────
  const emitWithAck = useCallback((event, payload, timeout = 5000) => {
    console.log(`Emitting event '${event}' with payload:`, payload);
    return new Promise((resolve, reject) => {
      const client = socketRef.current;

      if (!client?.connected) {
        return reject(new Error('Socket not connected'));
      }

      const timer = setTimeout(() => {
        reject(new Error(`${event} timed out after ${timeout}ms`));
      }, timeout);

      client.emit(event, payload, (response) => {
        clearTimeout(timer);
        resolve(response);
      });
    });
  }, []);

  // ─── Send raw message (fire and forget) ───────────────────────────────
  const sendMessage = useCallback((destination, body) => {
    const client = socketRef.current;
    if (client?.connected) {
      client.emit(destination, body);
      return true;
    }
    console.warn('sendMessage failed — socket not connected');
    return false;
  }, []);

  // ─── Send match command with acknowledgement ───────────────────────────
  // Helper to build canonical gameState snapshot for socket payloads
  const buildGameStateSnapshot = useCallback(() => {
    // Use latest Redux state for snapshot
    const state = globalThis.__REDUX_STORE__?.getState?.() || {};
    const game = state.game || {};
    console.log(state.game)
    return {
      activePlayer: game.activePlayer,
      currentPlayer: game.currentPlayer,
      timeRemaining: game.timeRemaining,
      isTimerRunning: game.isTimerRunning,
      stateVersion: game.stateVersion,
      status: game.gamePaused ? 'paused' : 'active',
      soldiers: {
        blue: game.blueSoldiers || [],
        red: game.redSoldiers || [],
        yellow: game.yellowSoldiers || [],
        green: game.greenSoldiers || [],
      },
      cards: {
        blue: game.blueCards || [],
        red: game.redCards || [],
        yellow: game.yellowCards || [],
        green: game.greenCards || [],
      },
    };
  }, []);

  const sendMatchCommand = useCallback(async ({ type, payload = {}, matchId, playerId }) => {
    console.log(`Preparing to send match command: ${type} with payload:`, payload);
      const includeSnapshot = type === 'movePlayer' || type === 'enterNewSoldier' || type === 'skipTurn';
    console.log(includeSnapshot, 'Sending command without gameState snapshot');
    if (!matchId || !type) {
      console.warn('sendMatchCommand: missing matchId or type');
      return { status: 'error', reason: 'missing_params' };
    }

    // Only include gameState for move/turn events
  
    const message = {
      type,
      payload,
      userId:    userRef.current?.id,
      sessionId: matchId,
      ...(playerId && { playerId }),
      ...(includeSnapshot ? { gameState: buildGameStateSnapshot() } : {}),
    };

    try {
      const response = await emitWithAck(`/app/player.Move/${matchId}`, message);

      if (response?.status === 'error') {
        console.warn('sendMatchCommand rejected:', response.reason);

        if (response.reason === 'not_your_turn') {
          // Desync detected — request full state from server
          requestFullSync(matchId);
        }
      }

      return response;

    } catch (err) {
      // Timeout — server never responded
      console.error('sendMatchCommand timed out:', err.message);
      requestFullSync(matchId);
      return { status: 'error', reason: 'timeout' };
    }
  }, [emitWithAck, buildGameStateSnapshot]);

  // ─── Request full game state (fixes desync) ────────────────────────────
  const requestFullSync = useCallback((matchId) => {
    const id = matchId || currentMatchRef.current?.id;
    if (!id) return;

    emitWithAck('requestGameState', { sessionId: id })
      .then((response) => {
        if (response?.status === 'ok' && response.gameState) {
          console.log('Syncing game state from server', response.gameState);
          dispatch(applyServerStateSnapshot(response.gameState));
        }
      })
      .catch((err) => {
        console.error('Full sync failed:', err.message);
      });
  }, [emitWithAck, dispatch]);

  // ─── Subscribe to a topic ──────────────────────────────────────────────
  const subscribe = useCallback((topic, callback) => {
    const client = socketRef.current;

    if (!client) {
      console.warn(`subscribe('${topic}') called before socket initialized`);
      return null;
    }

    const handler = (data) => {
      if (callback) callback(data);
    };

    // ✅ Works even if not connected yet — registers for when it connects
    client.on(topic, handler);

    return {
      unsubscribe: () => client.off(topic, handler),
    };
  }, []);

  // ─── Reconnect manually ───────────────────────────────────────────────
  const reconnectSocket = useCallback(() => {
    const client = socketRef.current;
    if (client && !client.connected) {
      console.log('Manually reconnecting socket...');
      client.connect();
    }
  }, []);

  // ─── Main socket setup ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOnline) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const client = io(WEBSOCKET_URL, {
      transports:              ['websocket', 'polling'],
      timeout:                 10000,
      reconnection:            true,
      reconnectionAttempts:    Infinity,
      reconnectionDelay:       1000,
      reconnectionDelayMax:    5000,
      withCredentials:         false,
      autoConnect:             true,
    });

    socketRef.current = client;

    client.on('connect', () => {
      console.log('Socket connected:', client.id);
      setConnected(true);

      // ✅ Register user on EVERY connect — not just the first time
      // This covers reconnects too
      setTimeout(() => registerUser(client), 500);
    });

    client.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);

      // ✅ Re-sync game state after reconnect — catch up on missed moves
      const matchId = currentMatchRef.current?.id;
      if (matchId) {
        requestFullSync(matchId);
      }
    });

    client.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);

      // Auto-reconnect unless server forced disconnect
      if (reason === 'io server disconnect') {
        console.log('Server forced disconnect — reconnecting...');
        client.connect();
      }
    });

    client.on('connect_error', (error) => {
      console.error('Socket connection error:', error?.message || error);
    });

    return () => {
      client.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isOnline]);

  // ─── Context value ─────────────────────────────────────────────────────
  const value = useMemo(() => ({
    socketClient: socketRef.current,
    connected,
    subscribe,
    sendMessage,
    sendMatchCommand,
    emitWithAck,       // ✅ exposed so components can use it directly
    requestFullSync,   // ✅ exposed so components can trigger resync
    reconnect: reconnectSocket,
  }), [connected, subscribe, sendMessage, sendMatchCommand, emitWithAck, requestFullSync, reconnectSocket]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};