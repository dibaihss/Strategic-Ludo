import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { Platform } from 'react-native';

// --- WebSocket URL Configuration ---
const PRODUCTION_WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'https://api-ludo-app-gtvtnw.fly.dev';
const LOCALHOST_WS_URL = 'http://localhost:3000';
const ANDROID_WS_URL = 'http://192.168.178.130:3000';

// Choose the appropriate WebSocket URL based on platform and environment
let WEBSOCKET_URL;
if (__DEV__) {
  if (Platform.OS === 'android') {
    WEBSOCKET_URL = ANDROID_WS_URL;
  } else {
    WEBSOCKET_URL = LOCALHOST_WS_URL;
  }
} else {
  WEBSOCKET_URL = PRODUCTION_WS_URL;
}

// --- END: WebSocket URL Configuration ---
// Create the context
const WebSocketContext = createContext(null);

// Create a provider component
export const WebSocketProvider = ({ children }) => {

  const [socketClient, setSocketClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState({});
  const isOnline = useSelector(state => state.game.isOnline);


  const reconnectSocket = () => {
    if (socketClient && !socketClient.connected) {
      console.log('Reconnecting Socket.IO client...');
      socketClient.connect();
    }
  };

  const sendMessage = (destination, body) => {
    if (socketClient && socketClient.connected) {
      socketClient.emit(destination, body);
      return true;
    }
    return false;
  };

  const sendMatchCommand = ({ type, payload = {}, matchId, playerId }) => {
    if (!matchId || !type) return false;
    const message = { type, payload };
    if (playerId) {
      message.playerId = playerId;
    }
    return sendMessage(`/app/player.Move/${matchId}`, message);
  };

  useEffect(() => {
    if (!isOnline) {
      if (socketClient) {
        socketClient.disconnect();
        setSocketClient(null);
      }
      setConnected(false);
      return;
    }

    const client = io(WEBSOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      withCredentials: false,
      autoConnect: true,
    });

    client.on('connect', () => {
      console.log('Connected to Socket.IO');
      setConnected(true);
    });

    client.on('disconnect', () => {
      console.log('Disconnected from Socket.IO');
      setConnected(false);
    });

    client.on('connect_error', (error) => {
      console.error('Socket.IO error:', error?.message || error);
    });

    setSocketClient(client);

    // Cleanup on unmount
    return () => {
      client.disconnect();
      setConnected(false);
    };
  }, [isOnline]);

  // Subscribe to a topic
  const subscribe = (topic, callback) => {
    if (socketClient && socketClient.connected) {
      const handler = (data) => {
        if (callback) callback(data);
      };
      socketClient.on(topic, handler);
      return {
        unsubscribe: () => socketClient.off(topic, handler)
      };
    }
    return null;
  };

  // The value that will be provided to consumers of this context
  const value = {
    stompClient: socketClient,
    socketClient,
    connected,
    messages,
    subscribe,
    sendMessage,
    sendMatchCommand,
    reconnect: reconnectSocket,
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
