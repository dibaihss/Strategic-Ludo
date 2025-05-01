import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJs from 'sockjs-client';
import { useSelector, useDispatch } from 'react-redux';

// --- START: WebSocket URL Configuration ---
const PRODUCTION_WS_URL = 'https://strategic-ludo-srping-boot.onrender.com/ws';
// Use your local IP for physical devices, 10.0.2.2 for Android emulator, or localhost for iOS simulator/web
const LOCALHOST_WS_URL = 'http://localhost:8080/ws'; // Or your local backend port

const WEBSOCKET_URL = __DEV__ ? LOCALHOST_WS_URL : PRODUCTION_WS_URL;

console.log(`Using WebSocket URL: ${WEBSOCKET_URL}`); // Optional: Log which URL is being used
// --- END: WebSocket URL Configuration ---
// Create the context
const WebSocketContext = createContext(null);

// Create a provider component
export const WebSocketProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState({});
  const onlineModus = useSelector(state => state.game.onlineModus);

  useEffect(() => {
    if (!onlineModus) return; // Don't create a WebSocket connection if onlineModus is false
    // Create STOMP client
    const client = new Client({
      webSocketFactory: () => {
        const socket = new SockJs(WEBSOCKET_URL, null, {
          transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
          timeout: 10000,
          headers: {
            'Origin': 'http://localhost:8081'
          }
        });
        return socket;
      },
      onConnect: () => {
        console.log('Connected to WebSocket');
        setConnected(true);
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
        setConnected(false);
      },
      onStompError: (error) => {
        console.error('STOMP error:', error);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    // Activate the client
    client.activate();
    setStompClient(client);

    // Cleanup on unmount
    return () => {
      if (client && client.connected) {
        client.deactivate();
      }
    };
  }, [onlineModus]);

  // Subscribe to a topic
  const subscribe = (topic, callback) => {

    if (stompClient && stompClient.connected) {
      return stompClient.subscribe(topic, (message) => {
        const data = JSON.parse(message.body);
        // Update messages state
        // setMessages(prev => ({
        //   ...prev,
        //   [topic]: data
        // }));
      
        // Call the callback if provided
        if (callback) callback(data);
      });
    }
    return null;
  };

  // Send a message
  const sendMessage = (destination, body) => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination,
        body: JSON.stringify(body)
      });
      return true;
    }
    return false;
  };

  // The value that will be provided to consumers of this context
  const value = {
    stompClient,
    connected,
    messages,
    subscribe,
    sendMessage
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