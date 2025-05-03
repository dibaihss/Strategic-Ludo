import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJs from 'sockjs-client';
import { useSelector, useDispatch } from 'react-redux';
import { AppState, Platform } from 'react-native';
import Toast from 'react-native-toast-message'; // Import Toast
import { updateCurrentUserStatus} from '../store/dbSlice.jsx'; // Import the action to update user status


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

console.log(`Using WebSocket URL: ${WEBSOCKET_URL} on platform: ${Platform.OS}`);
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
  const user = useSelector(state => state.auth.user);
  const currentMatch = useSelector(state => state.auth.currentMatch);

  // Platform-specific app state tracking
  const appState = useRef(Platform.OS === 'web' ? 'active' : AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const activeSubscriptions = useRef(new Map());

  // Handle visibility change for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web-specific visibility API
      const handleVisibilityChange = () => {
        const nextAppState = document.hidden ? 'background' : 'active';
        console.log('Web visibility changed:', nextAppState);
        if(nextAppState === 'background'){
          dispatch(updateCurrentUserStatus(false));
        } 
          
        if(nextAppState === 'active' && !user.status){
          dispatch(updateCurrentUserStatus(true));
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
    } else {
      // React Native AppState API for mobile
      const subscription = AppState.addEventListener('change', nextAppState => {
        console.log('App state changed:', nextAppState);
        appState.current = nextAppState;
        setAppStateVisible(nextAppState);
        if(nextAppState === 'background') dispatch(updateCurrentUserStatus(false));
        if(nextAppState === 'active') dispatch(updateCurrentUserStatus(true));
             
        if (nextAppState === 'active' && onlineModus) {
          if (!connected && stompClient) {
            console.log('App became active, reconnecting WebSocket...');
            reconnectWebSocket();
          }
        }
      });

      return () => {
        if (subscription?.remove) {
          subscription.remove();
        }
      };
    }
  }, [onlineModus, connected, stompClient]);

  // Function to reconnect WebSocket
  const reconnectWebSocket = () => {
    if (stompClient) {
      if (!stompClient.connected) {
        console.log('Attempting to reconnect WebSocket...');
        stompClient.deactivate();
        setTimeout(() => {
          stompClient.activate();
        }, 1000);
      }
    }
  };

  // Create and manage WebSocket client
  useEffect(() => {
    if (!onlineModus) {
      if (stompClient && stompClient.connected) {
        console.log('Disconnecting WebSocket - online mode disabled');
        stompClient.deactivate();
        setStompClient(null);
        setConnected(false);
      }
      return;
    }

    // Create STOMP client with improved configuration
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

        // Resubscribe to previous topics when reconnecting
        if (activeSubscriptions.current.size > 0) {
          console.log('Resubscribing to topics after reconnection...');
          activeSubscriptions.current.forEach((callback, topic) => {
            console.log(`Resubscribing to ${topic}`);
            client.subscribe(topic, (message) => {
              const data = JSON.parse(message.body);
              if (callback) callback(data);
            });
          });
        }
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
        setConnected(false);
      },
      onStompError: (error) => {
        console.error('STOMP error:', error);
      },
      // More aggressive reconnection settings
      reconnectDelay: 2000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    // Activate the client
    client.activate();
    setStompClient(client);

    // Cleanup on unmount
    return () => {
      console.log('WebSocket provider unmounting, cleaning up...');
      if (client && client.connected) {
        client.deactivate();
      }
    };
  }, [onlineModus]);

  const subscribe = (topic, callback) => {
    console.log(`Subscribing to ${topic}`);

    if (stompClient && stompClient.connected) {
      // Store the callback for this topic to reuse on reconnection
      activeSubscriptions.current.set(topic, callback);

      // When subscribing, notify other users that this user joined
      if (user && user.id && topic.startsWith('/topic/gameStarted/')) {
        const matchId = topic.split('/').pop();
        console.log("User joined the match!", appState.current);
        if (appState.current === 'active') {
          sendMessage(`/app/waitingRoom.notifications/${matchId}`, {
            type: 'userJoined',
            userId: user.id,
            username: user.name || user.email || user.username || 'User',
            timestamp: new Date().toISOString(),
            platform: Platform.OS, // Add platform information
          });
        } else if (appState.current === 'background') {
          console.log("User left the match!", appState.current);

          sendMessage(`/app/waitingRoom.notifications/${matchId}`, {
            type: 'userLeft',
            userId: user.id,
            username: user.name || user.email || user.username || 'User',
            timestamp: new Date().toISOString(),
            platform: Platform.OS, // Add platform information,,
          });

        }
      }
      const subscription = stompClient.subscribe(topic, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log(`Received message from ${topic}:`, data);

          // Handle notification messages
          if (data.type === 'userLeft' || data.type === 'userJoined' || data.type === 'userAFK') {
            if (user && data.userId !== user.id) {
              Toast.show({
                type: data.type === 'userJoined' ? 'success' : 'info',
                text1: data.type === 'userJoined'
                  ? 'Player joined'
                  : (data.type === 'userAFK' ? 'Player is AFK' : 'Player left'),
                text2: `${data.username} ${data.type === 'userJoined'
                  ? 'has joined the match'
                  : (data.type === 'userAFK' ? 'is away from keyboard' : 'has left the match')}`,
                position: 'bottom',
                visibilityTime: 4000,
              });
            }

          }

          // Call the callback if provided
          if (callback) callback(data);
        } catch (error) {
          console.error(`Error processing message from ${topic}:`, error);
        }
      });

      // Return an enhanced subscription object
      return {
        unsubscribe: () => {
          if (user && user.id && topic.startsWith('/topic/gameStarted/')) {
            const matchId = topic.split('/').pop();

            // Check if the app is in background or inactive
            const isBackground = appStateVisible !== 'active';
            sendMessage(`/app/waitingRoom.notifications/${matchId}`, {
              type: isBackground ? 'userAFK' : 'userLeft',
              userId: user.id,
              username: user.name || user.email || user.username || 'User',
              timestamp: new Date().toISOString(),
              platform: Platform.OS // Add platform information
            });
          }
          activeSubscriptions.current.delete(topic);
          subscription.unsubscribe();
        }
      };
    }

    console.warn(`Failed to subscribe to ${topic}: Client not connected`);
    return {
      unsubscribe: () => console.log(`No need to unsubscribe from ${topic}, was never subscribed`)
    };
  };

  // Send a message with better error handling
  const sendMessage = (destination, body) => {
    console.log(`Attempting to send message to ${destination}`);

    if (!stompClient) {
      console.error('Cannot send message: STOMP client is null');
      return false;
    }

    if (!stompClient.connected) {
      console.error('Cannot send message: STOMP client not connected');
      // Try to reconnect if we're in online mode
      if (onlineModus && appStateVisible === 'active') {
        console.log('Attempting to reconnect before sending message...');
        reconnectWebSocket();
      }
      return false;
    }

    try {
      stompClient.publish({
        destination,
        body: JSON.stringify(body)
      });
      console.log(`Message sent to ${destination} successfully`);
      return true;
    } catch (error) {
      console.error(`Error sending message to ${destination}:`, error);
      return false;
    }
  };

  // Check connection status
  const checkConnection = () => {
    if (stompClient && !stompClient.connected && onlineModus) {
      console.log('Connection check: Reconnecting WebSocket...');
      reconnectWebSocket();
    }
    return connected;
  };
 
  // The value that will be provided to consumers of this context
  const value = {
    stompClient,
    connected,
    messages,
    subscribe,
    sendMessage,
    checkConnection,
    reconnect: reconnectWebSocket
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
      <Toast />
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