import React from 'react';
import { useDispatch } from 'react-redux';
import HomePage from './Home.jsx';
import { resetTimer, setActivePlayer } from '../assets/store/gameSlice.jsx';
import { logout, clearAuth} from '../assets/store/dbSlice.jsx';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();



  const handleStartLocalGame = () => {
    dispatch(resetTimer());
    dispatch(setActivePlayer());
    navigation.navigate('Game', { mode: 'local' });
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
      onStartLocalGame={handleStartLocalGame}
      onStartMultiplayerGame={handleStartMultiplayerGame}
      onLogout={handleLogout}
    />
  );
}