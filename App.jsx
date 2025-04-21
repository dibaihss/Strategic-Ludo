import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, Platform, Dimensions, Modal, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import SmalBoard from './GameComponents/SmalBoard.jsx';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './assets/store/store.jsx';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Goals from './GameComponents/Goals.jsx';
import Bases from './GameComponents/Bases.jsx';
import Timer from './GameComponents/Timer.jsx';
import { MaterialIcons } from '@expo/vector-icons';
import { setTheme } from './assets/store/themeSlice.jsx';
import {
  resetTimer
} from './assets/store/gameSlice.jsx';
const gameInstructions = {
  ar: {
    title: "تعليمات اللعبة",
    content: `اللعبة هي لعبة Ludo (لودو)، وهي لعبة لوحية تُلعب عادةً بين 2 إلى 4 لاعبين. كل لاعب يملك أربع قطع (أو أحجار) بلون معين، والهدف هو إدخال جميع قطعه إلى "المنزل" في منتصف اللوحة بعد أن تدور دورة كاملة على المسار.

وصف اللعبة: 🎲

الألوان الأربعة: أحمر، أزرق، أخضر، وأرجواني (بنفسجي).

كل لاعب يبدأ بأربعة أحجار في المنطقة المخصصة له.

يملك ست ازرار من 1 الى 6 
اذا ضغطت ع سبيل المثال 6 سيتقدم اللاعب ست خطوات الى الامام 

يمكن للاعب أن يأكل قطعة لاعب آخر إذا وصل إلى نفس المربع (ما عدا المربعات الآمنة).

شروط الفوز: 🎯

1. على كل لاعب أن يقوم بإدخال جميع قطعه الأربع إلى المسار الداخلي الذي يؤدي إلى مركز اللوحة.

2. يجب أن تدور كل قطعة دورة كاملة على اللوحة قبل أن تدخل "المنزل".

3. أول لاعب يُدخل كل قطعه إلى "المنزل" يفوز.

4. كل لاعب يلعب دو عندما يلعبه يذهب الدور الى اللاعب الاخر`

  },
  en: {
    title: "Game Instructions",
    content: `Ludo is a board game typically played between 2 to 4 players. Each player has four pieces (or tokens) of a specific color, and the goal is to move all pieces to the "home" in the center of the board after completing a full circuit.

Game Description: 🎲

Four Colors: Red, Blue, Green, and Purple.

Each player starts with four tokens in their designated area.

Players have six buttons numbered 1 to 6
For example, if you press 6, your token will move six steps forward

A player can capture another player's token by landing on the same square (except for safe squares).

Winning Conditions 🎯:

1. Each player must move all four tokens into the inner path leading to the center of the board.

2. Each token must complete a full circuit around the board before entering "home".

3. The first player to get all tokens into their "home" wins.

4. It is a turn-based game. Each player plays one time, then the role goes to the next player`
  },
  de: {
    title: "Spielanleitung",
    content: `Ludo ist ein Brettspiel, das typischerweise von 2 bis 4 Spielern gespielt wird. Jeder Spieler hat vier Spielfiguren (oder Steine) in einer bestimmten Farbe, und das Ziel ist es, alle Figuren ins "Haus" in der Mitte des Spielbretts zu bringen, nachdem sie eine vollständige Runde gedreht haben.

Spielbeschreibung: 

Vier Farben: Rot, Blau, Grün und Lila.

Jeder Spieler beginnt mit vier Steinen in seinem zugewiesenen Bereich.

Spieler haben sechs Knöpfe von 1 bis 6
Wenn Sie zum Beispiel 6 drücken, bewegt sich Ihr Stein sechs Schritte vorwärts

Ein Spieler kann einen Stein eines anderen Spielers schlagen, indem er auf dasselbe Feld zieht (außer auf sichere Felder).

Gewinnbedingungen: 🎯

1. Jeder Spieler muss alle vier Steine auf den inneren Pfad bringen, der zur Mitte des Spielbretts führt.

2. Jeder Stein muss eine vollständige Runde um das Brett machen, bevor er ins "Haus" eintreten kann.

3. Der erste Spieler, der alle Steine in sein "Haus" bringt, gewinnt.

4. Jeder Spieler kann einmal spielen, dann ist der andere Spieler an der Reihe`
  }
};

function AppContent() {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const themeList = useSelector(state => state.theme.themes);
  const [showModal, setShowModal] = useState(true);
  const [language, setLanguage] = useState('en');
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const isSmallScreen = windowWidth < 375 || windowHeight < 667;

  useEffect(() => {
    // Get system language
    const systemLang = Platform.OS === 'web' 
      ? navigator.language.split('-')[0]
      : Platform.OS === 'ios'
        ? 'en' // You would use NativeModules.SettingsManager.settings.AppleLocale
        : 'en'; // You would use NativeModules.I18nManager.localeIdentifier
    
    // Set language based on supported languages
    setLanguage(gameInstructions[systemLang] ? systemLang : 'en');
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

        <Modal
          animationType="fade"
          transparent={true}
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{gameInstructions[language].title}</Text>
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.modalText}>{gameInstructions[language].content}</Text>
              </ScrollView>
              <Pressable
                style={styles.closeButton}
                onPress={() =>{
                  setShowModal(false)
                  dispatch(resetTimer())
                } }
              >
                <Text style={styles.closeButtonText}>
                  {language === 'ar' ? 'فهمت' : language === 'de' ? 'Verstanden' : 'Got it'}
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
    </Provider>
  );
}
