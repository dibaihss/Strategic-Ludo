import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJs from 'sockjs-client';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserStatus, leaveMatch} from '../store/dbSlice.jsx'; // Import the action to update user status
import { AppState, Platform } from 'react-native';

// --- WebSocket URL Configuration ---
const PRODUCTION_WS_URL = 'https://strategic-ludo-srping-boot.onrender.com/ws';
const LOCALHOST_WS_URL = 'http://localhost:8080/ws'; // Default for iOS
const ANDROID_WS_URL = 'http://192.168.178.130:8080/ws'; // Android-specific URL with port

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
    const dispatch = useDispatch();
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState({});
  const onlineModus = useSelector(state => state.game.onlineModus);
  const appState = useRef(Platform.OS === 'web' ? 'active' : AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const user = useSelector(state => state.auth.user);
  const currentMatch = useSelector(state => state.auth.currentMatch);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web-specific visibility API
      const handleVisibilityChange = () => {
        const nextAppState = document.hidden ? 'background' : 'active';
        console.log('Web visibility changed:', nextAppState);
        if(nextAppState === 'background' && user){
            dispatch(updateUserStatus(false));
          sendMessage(`/app/waitingRoom.gameStarted/${currentMatch.id}`, { type: 'userInactive', userId: user.id })

        } 
        if(nextAppState === 'active' && user && user.status === false){
            dispatch(updateUserStatus(true));
          sendMessage(`/app/waitingRoom.gameStarted/${currentMatch.id}`, { type: 'userBack', userId: user.id })
        } 
             
        appState.current = nextAppState;
        setAppStateVisible(nextAppState);

        if (nextAppState === 'active' && onlineModus) {
          if (!connected && stompClient) {
            
            console.log('Web page became visible, reconnecting WebSocket...');
            reconnectWebSocket();
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [onlineModus, connected, stompClient,user]);

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
        if(currentMatch?.id){
          dispatch(leaveMatch(currentMatch.id));
          sendMessage(`/app/waitingRoom.gameStarted/${currentMatch.id}`, { type: 'userDisconnected', userId: user.id })          
        }

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