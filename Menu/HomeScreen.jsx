import { setActivePlayer, resetTimer, setOnlineModus } from '../assets/store/gameSlice.jsx';
import { useDispatch, useSelector } from 'react-redux';
import HomePage from './Home.jsx';


export default function HomeScreen({ navigation }) {
    const dispatch = useDispatch();
  
    const handleStartLocalGame = () => {
      dispatch(resetTimer());
      dispatch(setActivePlayer());
      navigation.navigate('Game', { mode: 'local' });
    };
  
    const handleStartMultiplayerGame = () => {
  
      dispatch(setOnlineModus(true));
      dispatch(resetTimer());
      dispatch(setActivePlayer());
      navigation.navigate('Game', { mode: 'multiplayer' });
    };
  
    return (
      <HomePage
        onStartLocalGame={handleStartLocalGame}
        onStartMultiplayerGame={handleStartMultiplayerGame}
      />
    );
  }