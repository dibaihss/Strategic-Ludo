import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserStatus, leaveMatch } from '../store/dbSlice.jsx';
import { AppState, Platform } from 'react-native';
import { mapLegacySendToCanonical, mapLegacyTopicToCanonicalEvents, shouldDeliverLegacyTopicMessage, toLegacyPayload } from './realtime/mapping';
import { normalizePayload } from './realtime/utils';
import { SocketIoAdapter } from './realtime/SocketIoAdapter';

// --- Realtime Socket.IO Configuration ---
let ExpoConstants = null;
try {
  ExpoConstants = require('expo-constants');
} catch (e) {
  ExpoConstants = null;
}

const PRODUCTION_SOCKET_URL = 'https://lowcostbackendapp-dze4chctcsevdybb.westeurope-01.azurewebsites.net';
const LOCALHOST_SOCKET_URL = 'http://localhost:3000';
const ANDROID_SOCKET_URL = 'http://192.168.178.130:8080';
const SOCKET_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SOCKET_URL) ||
  (ExpoConstants && (ExpoConstants.manifest?.extra?.REACT_APP_SOCKET_URL || ExpoConstants.expoConfig?.extra?.REACT_APP_SOCKET_URL)) ||
  (__DEV__ ? (Platform.OS === 'android' ? ANDROID_SOCKET_URL : LOCALHOST_SOCKET_URL) : PRODUCTION_SOCKET_URL);

const SOCKET_TOKEN = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SOCKET_AUTH_TOKEN) ||
  (ExpoConstants && (ExpoConstants.manifest?.extra?.REACT_APP_SOCKET_AUTH_TOKEN || ExpoConstants.expoConfig?.extra?.REACT_APP_SOCKET_AUTH_TOKEN)) ||
  '';

const SOCKET_PATH = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SOCKET_PATH) ||
  (ExpoConstants && (ExpoConstants.manifest?.extra?.REACT_APP_SOCKET_PATH || ExpoConstants.expoConfig?.extra?.REACT_APP_SOCKET_PATH)) ||
  '/socket.io';

const TRANSPORT = ((typeof process !== 'undefined' && process.env && process.env.REACT_APP_RT_TRANSPORT) ||
  (ExpoConstants && (ExpoConstants.manifest?.extra?.REACT_APP_RT_TRANSPORT || ExpoConstants.expoConfig?.extra?.REACT_APP_RT_TRANSPORT)) ||
  'socketio').toLowerCase();

// --- END: Realtime Socket.IO Configuration ---
// Create the context
const WebSocketContext = createContext(null);

// Create a provider component
export const WebSocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const adapterRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [messages] = useState({});
  const onlineModus = useSelector(state => state.game.onlineModus);
  const appState = useRef(Platform.OS === 'web' ? 'active' : AppState.currentState);
  const user = useSelector(state => state.auth.user);
  const currentMatch = useSelector(state => state.auth.currentMatch);

  const disconnect = async () => {
    const adapter = adapterRef.current;
    if (!adapter) return;
    try {
      await adapter.leaveMatch(currentMatch?.id);
    } catch (error) {
      console.error('Failed to leave Socket.IO match room:', error);
    }
    adapter.disconnect();
  };

  const buildAdapter = useMemo(() => {
    return () => {
      if (TRANSPORT !== 'socketio') {
        console.warn(`Unsupported realtime transport "${TRANSPORT}". Falling back to socketio.`);
      }
      return new SocketIoAdapter({
        url: SOCKET_URL,
        token: SOCKET_TOKEN,
        path: SOCKET_PATH,
        onConnectionChange: setConnected,
        onError: (error) => console.error('Socket.IO error:', error),
      });
    };
  }, []);

  const connect = () => {
    if (!adapterRef.current) {
      adapterRef.current = buildAdapter();
    }
    adapterRef.current.connect();
  };

  const joinMatch = async (matchId) => {
    const adapter = adapterRef.current;
    if (!adapter || !matchId) return;
    await adapter.joinMatch(matchId);
  };

  const emit = async (eventName, payload, options = {}) => {
    const adapter = adapterRef.current;
    if (!adapter) return { ok: false, code: 'NO_ADAPTER' };
    return adapter.emit(eventName, payload, options);
  };

  const on = (eventName, handler) => {
    const adapter = adapterRef.current;
    if (!adapter) return;
    adapter.on(eventName, handler);
  };

  const off = (eventName, handlerOrId) => {
    const adapter = adapterRef.current;
    if (!adapter) return;
    adapter.off(eventName, handlerOrId);
  };

  // useEffect(() => {
  //   if (Platform.OS === 'web') {
  //     // Web-specific visibility API
  //     const handleVisibilityChange = () => {
  //       const nextAppState = document.hidden ? 'background' : 'active';
  //       console.log('Web visibility changed:', nextAppState);
  //       if (nextAppState === 'background' && user && currentMatch?.id) {
  //         dispatch(updateUserStatus(false));
  //         sendMessage(`/app/waitingRoom.gameStarted/${currentMatch.id}`, { type: 'userInactive', userId: user.id });
  //       }
  //       if (nextAppState === 'active' && user && user.status === false && currentMatch?.id) {
  //         dispatch(updateUserStatus(true));
  //         sendMessage(`/app/waitingRoom.gameStarted/${currentMatch.id}`, { type: 'userBack', userId: user.id });
  //       }

  //       appState.current = nextAppState;

  //       if (nextAppState === 'active' && onlineModus) {
  //         if (!connected) {
  //           console.log('Web page became visible, reconnecting realtime transport...');
  //           connect();
  //         }
  //       }
  //     };

  //     document.addEventListener('visibilitychange', handleVisibilityChange);

  //     return () => {
  //       document.removeEventListener('visibilitychange', handleVisibilityChange);
  //     };
  //   }
  // }, [onlineModus, connected, user, currentMatch?.id]);

  useEffect(() => {
    if (!onlineModus) {
      disconnect();
      return;
    }

    connect();
    return () => {
      disconnect();
    };
  }, [onlineModus]);

  useEffect(() => {

    if (!connected || !currentMatch?.id) return;
    joinMatch(currentMatch.id);
  }, [connected, currentMatch?.id]);

  useEffect(() => {
    if (!connected || !currentMatch?.id || !user?.id) return;
    return () => {
      if (connected && currentMatch?.id && user?.id) {
        dispatch(leaveMatch({ matchId: currentMatch.id, playerId: user.id }));
      }
    };
  }, [connected, currentMatch?.id, user?.id]);

  const subscribe = (topic, callback) => {
    const adapter = adapterRef.current;
    if (!adapter || !connected) return null;
    const { events } = mapLegacyTopicToCanonicalEvents(topic);
    const handlers = events.map((eventName) => {
      const handler = (envelope) => {
        const normalized = normalizePayload(envelope);
        if (!shouldDeliverLegacyTopicMessage(topic, normalized)) return;
        callback?.(toLegacyPayload(normalized));
      };
      adapter.on(eventName, handler);
      return { eventName, handler };
    });

    return {
      unsubscribe: () => {
        handlers.forEach(({ eventName, handler }) => {
          adapter.off(eventName, handler);
        });
      },
    };
  };

  const sendMessage = (destination, body, options = {}) => {
    const adapter = adapterRef.current;
    if (!adapter || !connected) return false;
    const mapped = mapLegacySendToCanonical(destination, body);
    emit(mapped.eventName, mapped.envelope, options).catch((error) => {
      console.error('Failed to emit Socket.IO event:', error);
    });
    return true;
  };

  // The value that will be provided to consumers of this context
  const value = {
    stompClient: adapterRef.current,
    connected,
    messages,
    connect,
    disconnect,
    joinMatch,
    emit,
    on,
    off,
    subscribe,
    sendMessage,
    transport: TRANSPORT,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook for using the WebSocket context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
