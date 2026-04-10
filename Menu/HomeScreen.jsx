import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import HomePage from './Home.jsx';
import { resetTimer, setActivePlayer } from '../assets/store/gameSlice.jsx';
import { logout, clearAuth} from '../assets/store/authSlice.jsx';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const [showOfflineOptions, setShowOfflineOptions] = useState(false);


  const handleStartOffline = () => {
    setShowOfflineOptions(true);
  };

  const handleChooseOfflineMode = (selectedMode) => {
    setShowOfflineOptions(false);
    dispatch(resetTimer());
    dispatch(setActivePlayer());
    navigation.navigate('Game', { mode: selectedMode });
  };

  const handleCancelOfflineChoice = () => {
    setShowOfflineOptions(false);
  };

  const handleStartMultiplayerGame = () => {
    // Navigate to the match list page
    navigation.navigate('MatchList');
  };

  const handleLogout = () => {
   
    dispatch(logout())
      .then(() => {
        dispatch(clearAuth())
        setTimeout(() => {
          navigation.navigate('Login');
        }
        , 1000); // Wait for 1 second before navigating
        // You could navigate here, but it's usually not necessary
        // If you do need to, use:
        
      });
  };

  return (
    <HomePage
      onStartMultiplayerGame={handleStartMultiplayerGame}
      onStartOffline={handleStartOffline}
      showOfflineOptions={showOfflineOptions}
      onChooseOfflineMode={handleChooseOfflineMode}
      onCancelOfflineChoice={handleCancelOfflineChoice}
      onLogout={handleLogout}
    />
  );
}
