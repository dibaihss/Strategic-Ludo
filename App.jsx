import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SmalBoard from './GameComponents/SmalBoard.jsx';

import { Provider } from 'react-redux';
import { store } from './assets/store/store.jsx';
import MoveAnimationExample from './GameComponents/Anoth.jsx';


export default function App() {

  return (
    <Provider store={store}>
            <View style={styles.container}>
                <SmalBoard />
                {/* <MoveAnimationExample /> */}
               {/* <AnimatedCard /> */}
            </View>
        </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
  padding: 10,
  flex: 1,
  margin: 10,
  },
});
