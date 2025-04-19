import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SmalBoard from './GameComponents/SmalBoard.jsx';

import { Provider } from 'react-redux';
import { store } from './assets/store/store.jsx';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Goals from './GameComponents/Goals.jsx';
import Bases from './GameComponents/Bases.jsx';



export default function App() {
  const renderControls = () => {
    return (
        <View style={styles.controls}>
            <Pressable
                style={styles.button}
            >
                <MaterialIcons name="casino" size={24} color="black" />
                <Text style={styles.buttonText}>Roll</Text>
            </Pressable>
        </View>
    );
};
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
    
          <SmalBoard />
          <Goals />
          <Bases />
          {/* {renderControls} */}

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
  controls: {
    position: 'absolute',
    bottom: -60,
    flexDirection: 'row',
    gap: 20,
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 123324342
},
button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e8ecf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d9e6',
    gap: 8,
},
buttonText: {
    fontSize: 16,
    color: '#2a3f5f',
    fontWeight: '500',
},
});
