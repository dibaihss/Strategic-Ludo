import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import SmalBoard from './GameComponents/SmalBoard.jsx';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './assets/store/store.jsx';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Goals from './GameComponents/Goals.jsx';
import Bases from './GameComponents/Bases.jsx';
import { MaterialIcons } from '@expo/vector-icons';
import { setTheme } from './assets/store/themeSlice.jsx';

function AppContent() {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const themeList = useSelector(state => state.theme.themes);

  const cycleTheme = () => {
    const themeNames = Object.keys(themeList);
    const currentIndex = themeNames.indexOf(theme.name);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    dispatch(setTheme(themeNames[nextIndex]));
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SmalBoard />
        <Goals />
        <Bases />
        <View style={[styles.controls, { backgroundColor: theme.colors.background }]}>
          <Pressable
            style={[styles.button, { 
              backgroundColor: theme.colors.button,
              borderColor: theme.colors.buttonBorder 
            }]}
            onPress={cycleTheme}
          >
            <MaterialIcons name="color-lens" size={24} color={theme.colors.buttonText} />
            <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
              Theme: {theme.name}
            </Text>
          </Pressable>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
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
    bottom: -20,
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
