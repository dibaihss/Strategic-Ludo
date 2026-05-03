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
import { clearAuth, clearStoredAuthData, doesStoredUserExist, loadStoredUser } from './assets/store/authSlice.jsx';
import { updateMatch } from './assets/store/sessionSlice.jsx';
import { warmBackendOnAppOpen } from './assets/store/sessionApiShared.jsx';
import { setIsOnline } from './assets/store/gameSlice.jsx';

import AppNavigator from './navigators/AppNavigator.jsx';
import AuthNavigator from './navigators/AuthNavigator.jsx';
import OfflineNavigator from './navigators/OfflineNavigator.jsx';

function RootNavigation() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const isOnline = useSelector((state) => state.game.isOnline);
  const [initialNavState, setInitialNavState] = React.useState(undefined);
  const [isLoading, setIsLoading] = React.useState(true);

  const clearRedirectStorage = async () => {
    await AsyncStorage.removeItem('REDIRECT_TO_GAME');
    await AsyncStorage.removeItem('REDIRECT_GAME_MODE');
    await AsyncStorage.removeItem('REDIRECT_BOT_DIFFICULTY');
    await AsyncStorage.removeItem('REDIRECT_FORCE_TUTORIAL');
    await AsyncStorage.removeItem('REDIRECT_MATCH_DATA');
  };

  const loadStoredUserIfValid = async () => {
    const storedAuth = await dispatch(loadStoredUser()).unwrap();
    const userStillExists = await doesStoredUserExist(storedAuth);

    if (userStillExists) {
      return storedAuth;
    }

    await clearStoredAuthData();
    dispatch(clearAuth());
    dispatch(setIsOnline(true));
    return null;
  };

  const restoreRedirectMatchData = async (mode, hasValidStoredUser) => {
    if (!hasValidStoredUser || mode !== 'multiplayer') {
      return;
    }

    const matchDataStr = await AsyncStorage.getItem('REDIRECT_MATCH_DATA');
    if (!matchDataStr) {
      return;
    }

    const matchData = JSON.parse(matchDataStr);
    dispatch(updateMatch(matchData));
  };

  const buildInitialGameParams = ({ mode, botDifficulty, forceTutorial }) => {
    const params = { mode };
    if (botDifficulty) params.botDifficulty = botDifficulty;
    if (forceTutorial === 'true') params.forceTutorial = true;
    return params;
  };

  const bootstrapRedirectSession = async () => {
    const mode = await AsyncStorage.getItem('REDIRECT_GAME_MODE');
    const botDifficulty = await AsyncStorage.getItem('REDIRECT_BOT_DIFFICULTY');
    const forceTutorial = await AsyncStorage.getItem('REDIRECT_FORCE_TUTORIAL');
    const isLoggedINLocalStorage = await AsyncStorage.getItem('REDIRECT_ISLOGGED_IN');

    const hasValidStoredUser = isLoggedINLocalStorage === 'true'
      ? Boolean(await loadStoredUserIfValid())
      : false;

    await restoreRedirectMatchData(mode, hasValidStoredUser);
    await clearRedirectStorage();

    if (!hasValidStoredUser && isLoggedINLocalStorage === 'true') {
      return;
    }

    const params = buildInitialGameParams({ mode, botDifficulty, forceTutorial });

    setInitialNavState({
      index: 1,
      routes: [
        { name: 'Home' },
        { name: 'Game', params },
      ],
    });
  };

  useEffect(() => {
    const handleBootRedirect = async () => {
      try {
        warmBackendOnAppOpen();

        const redirectFlag = await AsyncStorage.getItem('REDIRECT_TO_GAME');
        if (redirectFlag === 'true') {
          await bootstrapRedirectSession();
        } else {
          await loadStoredUserIfValid();
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
  else if (isOnline) Navigator = AuthNavigator;
  else Navigator = OfflineNavigator;

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