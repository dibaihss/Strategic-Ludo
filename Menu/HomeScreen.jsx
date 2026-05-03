import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomePage from './Home.jsx';
import { logout, clearAuth} from '../assets/store/authSlice.jsx';

const canReloadWindowLocation = () => typeof globalThis.window?.location?.reload === 'function';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [showOfflineOptions, setShowOfflineOptions] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showBotDifficultyPrompt, setShowBotDifficultyPrompt] = useState(false);

  const handleStartOffline = () => {
    setShowOfflineOptions(true);
  };

  const handleChooseOfflineMode = async (selectedMode) => {
    setShowOfflineOptions(false);
    if (selectedMode === 'bot') {
      setShowBotDifficultyPrompt(true);
      return;
    }

    await AsyncStorage.setItem('REDIRECT_TO_GAME', 'true');
    await AsyncStorage.setItem('REDIRECT_GAME_MODE', selectedMode);
    await AsyncStorage.setItem('REDIRECT_ISLOGGED_IN', isLoggedIn.toString());

    if (canReloadWindowLocation()) {
      globalThis.window.location.reload();
    } else {
      // For native, we rely on the App entry point to handle the flag on next boot
      // or we could use a library like react-native-restart if available.
      // As a fallback for native, we still navigate but the "clean session"
      // will happen on the next manual reload or we can implement a soft-reset.
      navigation.navigate('Game', { mode: selectedMode });
    }
  };

  const handleCancelOfflineChoice = () => {
    setShowOfflineOptions(false);
  };

  const handleCancelBotDifficultyPrompt = () => {
    setShowBotDifficultyPrompt(false);
    setShowOfflineOptions(true);
  };

  const handleChooseBotDifficulty = async (botDifficulty) => {
    setShowBotDifficultyPrompt(false);

    await AsyncStorage.setItem('REDIRECT_TO_GAME', 'true');
    await AsyncStorage.setItem('REDIRECT_GAME_MODE', 'bot');
    await AsyncStorage.setItem('REDIRECT_BOT_DIFFICULTY', botDifficulty);
    await AsyncStorage.setItem('REDIRECT_ISLOGGED_IN', isLoggedIn.toString());

    if (canReloadWindowLocation()) {
      globalThis.window.location.reload();
    } else {
      navigation.navigate('Game', { mode: 'bot', botDifficulty });
    }
  };

  const handleStartTutorial = async () => {
    await AsyncStorage.setItem('REDIRECT_TO_GAME', 'true');
    await AsyncStorage.setItem('REDIRECT_GAME_MODE', 'bot');
    await AsyncStorage.setItem('REDIRECT_BOT_DIFFICULTY', 'normal');
    await AsyncStorage.setItem('REDIRECT_FORCE_TUTORIAL', 'true');
    await AsyncStorage.setItem('REDIRECT_ISLOGGED_IN', isLoggedIn.toString());

    if (canReloadWindowLocation()) {
      globalThis.window.location.reload();
    } else {
      navigation.navigate('Game', { mode: 'bot', botDifficulty: 'normal', forceTutorial: true });
    }
  };

  const handleStartMultiplayerGame = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    navigation.navigate('MatchList');
  };

  const handleCancelLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  const handleConfirmLoginPrompt = () => {
    setShowLoginPrompt(false);
    navigation.navigate('Login');
  };

  const handleLogout = () => {
   
    dispatch(logout())
      .then(() => {
        dispatch(clearAuth())
        setTimeout(() => {
          navigation.navigate('Login');
        }
        , 1000); 
      });
  };

  return (
    <HomePage
      onStartMultiplayerGame={handleStartMultiplayerGame}
      onStartOffline={handleStartOffline}
      onStartTutorial={handleStartTutorial}
      showOfflineOptions={showOfflineOptions}
      onChooseOfflineMode={handleChooseOfflineMode}
      onCancelOfflineChoice={handleCancelOfflineChoice}
      showBotDifficultyPrompt={showBotDifficultyPrompt}
      onChooseBotDifficulty={handleChooseBotDifficulty}
      onCancelBotDifficultyPrompt={handleCancelBotDifficultyPrompt}
      showLoginPrompt={showLoginPrompt}
      onCancelLoginPrompt={handleCancelLoginPrompt}
      onConfirmLoginPrompt={handleConfirmLoginPrompt}
      onLogout={handleLogout}
    />
  );
}
