import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SmalBoard from './GameComponents/SmalBoard.jsx';

import { Provider } from 'react-redux';
import { store } from './assets/store/store.jsx';
import MoveAnimationExample from './Labor/Anoth.jsx';
import GesturePlayer from './Labor/GestureHandler.jsx';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Goals from './GameComponents/Goals.jsx';
import Bases from './GameComponents/Bases.jsx';


export default function App() {

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* <GesturePlayer color="blue" isSelected={true} /> */}
          <SmalBoard />
          <Goals />
          <Bases />
          {/* <MoveAnimationExample /> */}
          {/* <AnimatedCard /> */}
        </View>
      </GestureHandlerRootView>

    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
