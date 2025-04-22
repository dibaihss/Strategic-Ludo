import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, Platform, Dimensions, Modal, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import SmalBoard from './GameComponents/SmalBoard.jsx';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './assets/store/store.jsx';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Goals from './GameComponents/Goals.jsx';
import Bases from './GameComponents/Bases.jsx';
import Timer from './GameComponents/Timer.jsx';
import { MaterialIcons } from '@expo/vector-icons';
import { setTheme } from './assets/store/themeSlice.jsx';
import Toast from 'react-native-toast-message';
import { setActivePlayer, resetTimer } from './assets/store/gameSlice.jsx';
import { setSystemLanguage } from './assets/store/languageSlice.jsx';
import { gameInstructions, uiStrings, getLocalizedColor } from "./assets/shared/hardCodedData.js";
import ActivePlayerIndicator from './GameComponents/ActivePlayerIndicator.jsx';

function AppContent() {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const themeList = useSelector(state => state.theme.themes);
  const [showModal, setShowModal] = useState(true);
  const systemLang = useSelector(state => state.language.systemLang);
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const isSmallScreen = windowWidth < 375 || windowHeight < 667;

  useEffect(() => {
    // Get system language
    const detectedLang = Platform.OS === 'web'
      ? navigator.language.split('-')[0]
      : Platform.OS === 'ios'
        ? 'en' // You would use NativeModules.SettingsManager.settings.AppleLocale
        : 'en'; // You would use NativeModules.I18nManager.localeIdentifier

    // Set language based on supported languages
    dispatch(setSystemLanguage(gameInstructions[detectedLang] ? detectedLang : 'en'));
  }, []);

  const styles = StyleSheet.create({
    container: {
      padding: isSmallScreen ? 1 : 10,
      flex: 1,
      margin: isSmallScreen ? 1 : 10,
      justifyContent: "center",
      alignItems: "center",
    },
    controls: {
      position: 'absolute',
      bottom: isSmallScreen ? 20 : -20,
      left: isSmallScreen ? "25%" : "",
      flexDirection: 'row',
      gap: isSmallScreen ? 4 : 20,
      backgroundColor: '#ffffff',
      padding: isSmallScreen ? 2 : 10,
      borderRadius: 10,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        android: {
          elevation: 6,
        },
      }),
      zIndex: 999
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: isSmallScreen ? 2 : 10,
      backgroundColor: '#e8ecf4',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#d1d9e6',
      gap: isSmallScreen ? 2 : 10,
      elevation: isSmallScreen ? 3 : 0,
    },
    buttonText: {
      fontSize: isSmallScreen ? 14 : 16,
      color: '#2a3f5f',
      fontWeight: isSmallScreen ? 'bold' : '500',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 20,
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      padding: 20,
      borderRadius: 10,
      maxHeight: '80%',
      width: '90%',
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        android: {
          elevation: 5,
        },
      }),
    },
    modalScroll: {
      maxHeight: '100%',
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 15,
      color: theme.colors.buttonText,
      textAlign: 'center',
    },
    modalText: {
      fontSize: 16,
      color: theme.colors.buttonText,
      marginBottom: 20,
      lineHeight: 24,
    },
    closeButton: {
      backgroundColor: theme.colors.button,
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 10,
    },
    closeButtonText: {
      color: theme.colors.buttonText,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  const cycleTheme = () => {
    const themeNames = Object.keys(themeList);
    const currentIndex = themeNames.indexOf(theme.name);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    dispatch(setTheme(themeNames[nextIndex]));
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        
        <Timer />
        <SmalBoard />
        <Goals />
        <Bases />
        <View style={[styles.controls, { backgroundColor: theme.colors.background }]}>
          {/* <Pressable
            style={[styles.button, {
              backgroundColor: theme.colors.button,
              borderColor: theme.colors.buttonBorder
            }]}
            onPress={cycleTheme}
          >
            <MaterialIcons name="color-lens" size={24} color={theme.colors.buttonText} />
            <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
              {uiStrings[systemLang].themeButton.replace('{name}', theme.name)}
            </Text>
          </Pressable> */}
          <Pressable
            style={[styles.button, {
              backgroundColor: theme.colors.button,
              borderColor: theme.colors.buttonBorder
            }]}
            onPress={() => {
              dispatch(setActivePlayer(),
                dispatch(resetTimer())
              )
            }
            }>
            <MaterialIcons name="casino" size={24} color={theme.colors.buttonText} />
            <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
              {uiStrings[systemLang].skipButton}
            </Text>
          </Pressable>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{gameInstructions[systemLang].title}</Text>
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.modalText}>{gameInstructions[systemLang].content}</Text>
              </ScrollView>
              <Pressable
                style={styles.closeButton}
                onPress={() => {
                  setShowModal(false)
                  dispatch(setActivePlayer())
                  dispatch(resetTimer())
                 
                }}
              >
                <Text style={styles.closeButtonText}>
                  {uiStrings[systemLang].gotIt}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
      <Toast />
    </Provider>
  );
}
