import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { store } from './assets/store/store.jsx';
import { WebSocketProvider } from './assets/shared/webSocketConnection.jsx';
import { initAudio } from './assets/shared/audioManager';
import { loadStoredUser } from './assets/store/authSlice.jsx';
import { updateMatch } from './assets/store/sessionSlice.jsx';

import AppNavigator from './navigators/AppNavigator.jsx';
import AuthNavigator from './navigators/AuthNavigator.jsx';
import OfflineNavigator from './navigators/OfflineNavigator.jsx';

function RootNavigation() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const isOnline = useSelector((state) => state.game.isOnline);
  const [initialNavState, setInitialNavState] = React.useState(undefined);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const handleBootRedirect = async () => {
      try {
        const redirectFlag = await AsyncStorage.getItem('REDIRECT_TO_GAME');
        if (redirectFlag === 'true') {
          const mode = await AsyncStorage.getItem('REDIRECT_GAME_MODE');
          const botDifficulty = await AsyncStorage.getItem('REDIRECT_BOT_DIFFICULTY');

          await dispatch(loadStoredUser()).unwrap();

          // Restore match data from localStorage for multiplayer
          if (mode === 'multiplayer') {
            const matchDataStr = await AsyncStorage.getItem('REDIRECT_MATCH_DATA');
            if (matchDataStr) {
              const matchData = JSON.parse(matchDataStr);
              dispatch(updateMatch(matchData));
            }
          }

          const params = { mode };
          if (botDifficulty) params.botDifficulty = botDifficulty;

          await AsyncStorage.removeItem('REDIRECT_TO_GAME');
          await AsyncStorage.removeItem('REDIRECT_GAME_MODE');
          await AsyncStorage.removeItem('REDIRECT_BOT_DIFFICULTY');
          await AsyncStorage.removeItem('REDIRECT_MATCH_DATA');

          // Game is a root-level screen in both AppNavigator and OfflineNavigator
          setInitialNavState({
            index: 1, // index 1 = Game (Home is 0, Game is 1)
            routes: [
              { name: 'Home' },
              { name: 'Game', params },
            ],
          });
        } else {
          await dispatch(loadStoredUser()).unwrap();
        }
      } catch (e) {
        console.error("Boot redirect failed:", e);
      } finally {
        setIsLoading(false);
      }
    };

    handleBootRedirect();
  }, [dispatch]);

  if (isLoading) {
    return null;
  }

  let Navigator;

  if (isLoggedIn) Navigator = AppNavigator;
  else if (!isOnline) Navigator = OfflineNavigator;
  else Navigator = AuthNavigator;

  return (
    <NavigationContainer initialState={initialNavState}>
      <Navigator />
    </NavigationContainer>
  );
}

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