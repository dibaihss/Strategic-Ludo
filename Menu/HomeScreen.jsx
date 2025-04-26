import React from 'react';
import { useDispatch } from 'react-redux';
import HomePage from './Home.jsx';
import { resetTimer, setActivePlayer } from '../assets/store/gameSlice.jsx';

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
  
  return (
    <HomePage
      onStartLocalGame={handleStartLocalGame}
      onStartMultiplayerGame={handleStartMultiplayerGame}
    />
  );
}