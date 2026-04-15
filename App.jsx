import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { store } from './assets/store/store.jsx';
import { WebSocketProvider } from './assets/shared/webSocketConnection.jsx';
import { initAudio } from './assets/shared/audioManager';
import { loadStoredUser } from './assets/store/authSlice.jsx';

import AppNavigator from './navigators/AppNavigator.jsx';
import AuthNavigator from './navigators/AuthNavigator.jsx';
import OfflineNavigator from './navigators/OfflineNavigator.jsx';

function RootNavigation() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const isOnline = useSelector((state) => state.game.isOnline);

  useEffect(() => {
    dispatch(loadStoredUser());
  }, [dispatch]);

  let Navigator;

  if (isLoggedIn) Navigator = AppNavigator;
  else if (!isOnline) Navigator = OfflineNavigator;
  else Navigator = AuthNavigator;

  return (
    <NavigationContainer>
      <Navigator />
    </NavigationContainer>
  );
}

// --- Main App Component ---
export default function App() {
  useEffect(() => {
    initAudio().catch((err) => console.warn('Audio init failed:', err));
  }, []);

  return (
    <Provider store={store}>
      <WebSocketProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <RootNavigation />
            <Toast />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </WebSocketProvider>
    </Provider>
  );
}
