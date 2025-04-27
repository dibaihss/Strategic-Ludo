import SmalBoard from '../GameComponents/SmalBoard.jsx';
import { MaterialIcons } from '@expo/vector-icons';
import Goals from '../GameComponents/Goals.jsx';
import Bases from '../GameComponents/Bases.jsx';
import Timer from '../GameComponents/Timer.jsx';
import React, { useState, useEffect } from 'react';


import { useDispatch, useSelector } from 'react-redux';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Dimensions, Platform } from 'react-native';
import { setActivePlayer, resetTimer, setAssignOwner } from '../assets/store/gameSlice.jsx';
import { fetchCurrentMatch } from '../assets/store/dbSlice.jsx';
import { gameInstructions, uiStrings } from '../assets/shared/hardCodedData.js';


export default function GameScreen({ route }) {
  // ... existing GameScreen code ...
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const [showModal, setShowModal] = useState(true);
  const systemLang = useSelector(state => state.language.systemLang);
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const isSmallScreen = windowWidth < 375 || windowHeight < 667;
  const currentMatch = useSelector(state => state.auth.currentMatch);



  // Get the game mode from navigation params
  const { mode } = route.params;

  useEffect(() => {
    // Only set up websockets for multiplayer games
    if (mode === 'multiplayer') {
      // Initial fetch when component mounts
      dispatch(fetchCurrentMatch(currentMatch.id));
      console.log("currentMatch", currentMatch)

      if (currentMatch) {
        console.log(currentMatch.users.length)
        if (currentMatch.users.length > 2 ) {
          // Example player assignments for a 4-player game
          const playerAssignments = [
            { userId: currentMatch.users[0]?.id, color: 'blue' },
            { userId: currentMatch.users[1]?.id, color: 'red' },
            { userId: currentMatch.users[2]?.id ? currentMatch.users[2].id : currentMatch.users[0].id, color: 'yellow' },
            { userId: currentMatch.users[3]?.id ? currentMatch.users[3].id : currentMatch.users[1].id, color: 'green' }
          ];

          // Assign soldiers to users and update the assignOwner array
          dispatch(setAssignOwner(playerAssignments));
          
        }
      }
    }
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

  return (
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
          onPress={() => {
            dispatch(setActivePlayer());
            dispatch(resetTimer());
          }}
        >
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
              <Text style={styles.modalText}>
                {mode === 'multiplayer'
                  ? uiStrings[systemLang].multiplayerInstructions || gameInstructions[systemLang].content
                  : gameInstructions[systemLang].content
                }
              </Text>
            </ScrollView>
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                setShowModal(false);
                dispatch(setActivePlayer());
                dispatch(resetTimer());
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
  );
}