import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HomePage from './Home.jsx';
import { resetTimer, setActivePlayer } from '../assets/store/gameSlice.jsx';
import { logout, clearAuth} from '../assets/store/authSlice.jsx';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [showOfflineOptions, setShowOfflineOptions] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showBotDifficultyPrompt, setShowBotDifficultyPrompt] = useState(false);

  const handleStartOffline = () => {
    setShowOfflineOptions(true);
  };

  const handleChooseOfflineMode = (selectedMode) => {
    setShowOfflineOptions(false);
    if (selectedMode === 'bot') {
      setShowBotDifficultyPrompt(true);
      return;
    }

    dispatch(resetTimer());
    dispatch(setActivePlayer());
    navigation.navigate('Game', { mode: selectedMode });
  };

  const handleCancelOfflineChoice = () => {
    setShowOfflineOptions(false);
  };

  const handleCancelBotDifficultyPrompt = () => {
    setShowBotDifficultyPrompt(false);
    setShowOfflineOptions(true);
  };

  const handleChooseBotDifficulty = (botDifficulty) => {
    setShowBotDifficultyPrompt(false);
    dispatch(resetTimer());
    dispatch(setActivePlayer());
    navigation.navigate('Game', { mode: 'bot', botDifficulty });
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
