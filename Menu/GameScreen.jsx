import SmalBoard from '../GameComponents/SmalBoard.jsx';
import { MaterialIcons } from '@expo/vector-icons';
import Goals from '../GameComponents/Goals.jsx';
import Bases from '../GameComponents/Bases.jsx';
import Timer from '../GameComponents/Timer.jsx';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, StyleSheet, Pressable, Dimensions, Platform, ActivityIndicator, Modal, Alert } from 'react-native';
import { setActivePlayer, resetTimer, setOnlineModus, saveGameState, loadGameState, setCurrentPlayerColor } from '../assets/store/gameSlice.jsx';
import { uiStrings } from '../assets/shared/hardCodedData.js';

import { useWebSocket } from '../assets/shared/webSocketConnection.jsx'; // Import useWebSocket
import { setCurrentUserPage, leaveMatch } from '../assets/store/dbSlice.jsx';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';

export default function GameScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const isSmallScreen = windowWidth < 375 || windowHeight < 667;
  const currentMatch = useSelector(state => state.auth.currentMatch);
  const user = useSelector(state => state.auth.user);
  const playerColors = useSelector(state => state.game.playerColors);
  const activePlayer = useSelector(state => state.game.activePlayer);
  const currentPlayerColor = useSelector(state => state.game.currentPlayerColor);

  const gameState = useSelector(state => state.game);


  const [gameIsStarted, setGameIsStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false); // <-- Add this state

  // Get the game mode from navigation params
  const { mode, matchId } = route.params || { mode: 'local', matchId: 1 };
  const { connected, sendMessage } = useWebSocket();

  useEffect(() => {
    setCurrentUserPage('Game');
    // dispatch(loadGameState());
    
  }, [dispatch]);
  
  useEffect(() => {
    // Keep the device awake when the user is on the GameScreen
    activateKeepAwake();

    return () => {
      // Deactivate keep awake when leaving the GameScreen
      deactivateKeepAwake();
    };
  }, []);
  
  // Save game state automatically every 5 seconds
  // useEffect(() => {
  //   const saveInterval = setInterval(() => {
  //     dispatch(saveGameState());
  //   }, 3000); // Save every 5 seconds
    
  //   return () => {
  //     clearInterval(saveInterval);
  //     // Save one last time when component unmounts
  //     dispatch(saveGameState());
  //   };
  // }, [dispatch]);
  
  // Save when crucial game state changes
  // useEffect(() => {
  //   dispatch(saveGameState());
  // }, [
  //   gameState.activePlayer,
  //   currentMatch,
  // ]);

  useEffect(() => {
    console.log(playerColors)

      console.log(user)
      setGameIsStarted(true);
      setLoading(false);
    // }
  }, [mode, matchId, dispatch]);

  useEffect(() => {
    if (mode === 'multiplayer' && currentMatch && currentMatch.users) {
      const players = currentMatch.users;
     
      if (players.length >= 2) {
        dispatch(setCurrentPlayerColor(findUserColors())) 
        dispatch(setOnlineModus(true));
        setGameIsStarted(true);
      }
    }
  }, [currentMatch?.users, mode, dispatch]);

 

  const sendMoveUpdate = (message) => {
    sendMessage(`/app/player.Move/${currentMatch.id}`, JSON.stringify(message));
  };

  const findUserColor = () => {
    if (!user || !user.id || !playerColors) {
      return null; // Return null if user or playerColors aren't available
    }
    // Object.entries converts { blue: 'id1', red: 'id2' } to [ ['blue', 'id1'], ['red', 'id2'] ]
    const userEntry = Object.entries(playerColors).find(([color, userId]) => userId === user.id);
    // userEntry will be like ['blue', 'user123'] or undefined if not found
    console.log(userEntry)
    return userEntry ? userEntry[0] : null; // Return the color (first element) or null
  };
  const findUserColors = () => {
    if (!user || !user.id || !playerColors) {
      return []; // Return an empty array if user or playerColors aren't available
    }
  
    // Find all colors controlled by the user
    const userEntries = Object.entries(playerColors).filter(([color, userId]) => userId === user.id);
    // userEntries will be like [['blue', 'user123'], ['red', 'user123']] if the user controls two colors
    return userEntries.map(([color]) => color); // Return an array of colors
  };

  const skipTurn = () => {
    if (connected) {
      const userColor = findUserColor();
      if (userColor === activePlayer) {
        sendMoveUpdate({
          type: 'skipTurn'
        });
      }
    } else {
      dispatch(setActivePlayer());
      dispatch(resetTimer());
    }
  }

  const handleExitGame = () => {
    // Show the confirmation modal instead of navigating directly
    console.log(currentPlayerColor)
    setShowExitModal(true);
  };

  const confirmExitGame = () => {
    setShowExitModal(false); // Close the modal
    // Navigate back to home
    navigation.navigate('Home');
    handleLeaveMatch(); // Call the function to leave the match
  };

 const handleLeaveMatch = () => {
      if (currentMatch && currentMatch.id) {
        console.log("Leaving match", currentMatch.id)
        sendMessage(`/app/waitingRoom.gameStarted/${currentMatch.id}`, { type: 'userLeft', userId: user.id, colors: currentPlayerColor })
        dispatch(leaveMatch(currentMatch.id))
          .unwrap()
          .then(() => {
            console.log('User left successfully');
          })
          .catch(error => {
            console.error('Failed to leave match:', error);
          });
      }
    };

  const cancelExitGame = () => {
    setShowExitModal(false); // Close the modal
  };
  
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
      bottom: isSmallScreen ? 22 : -20,
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#333',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#333',
    },
    // --- Add Modal Styles ---
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay
    },
    modalContainer: {
      width: '85%',
      maxWidth: 350,
      padding: 25,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
    },
    modalMessage: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 25,
      lineHeight: 22,
    },
    modalButtonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    modalButton: {
      flex: 1, // Make buttons share space
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 5, // Add some space between buttons
    },
    cancelButton: {
      borderWidth: 1,
    },
    confirmButton: {
      // backgroundColor is set inline using theme
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '500',
    },
  });

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          {uiStrings[systemLang].loadingGame || 'Loading game...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {gameIsStarted ? (
        <>
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
                skipTurn();
              }}
            >
              <MaterialIcons name="casino" size={24} color={theme.colors.buttonText} />
              <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
                {uiStrings[systemLang].skipButton || 'Skip Turn'}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.button, {
                backgroundColor: theme.colors.button,
                borderColor: theme.colors.buttonBorder
              }]}
              onPress={handleExitGame}
            >
              <MaterialIcons name="exit-to-app" size={24} color={theme.colors.buttonText} />
              <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
                {uiStrings[systemLang].exitGame || 'Exit'}
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {uiStrings[systemLang].waitingForPlayers || 'Waiting for enough players to join...'}
          </Text>
          <Pressable
            style={[styles.button, {
              backgroundColor: theme.colors.button,
              marginTop: 20
            }]}
            onPress={handleExitGame}
          >
            <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
              {uiStrings[systemLang].backToLobby || 'Back to Lobby'}
            </Text>
          </Pressable>
        </View>
      )}
       {/* Exit Confirmation Modal */}
  <Modal
    visible={showExitModal}
    transparent={true}
    animationType="fade"
    onRequestClose={cancelExitGame} // Handle back button on Android
  >
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
          {uiStrings[systemLang].exitGameTitle || 'Exit Game?'}
        </Text>
        <Text style={[styles.modalMessage, { color: theme.colors.textSecondary }]}>
          {uiStrings[systemLang].exitGameConfirm || 'Are you sure you want to leave the current game?'}
        </Text>
        <View style={styles.modalButtonRow}>
          <Pressable
            style={[styles.modalButton, styles.cancelButton, { borderColor: theme.colors.border }]}
            onPress={cancelExitGame}
          >
            <Text style={[styles.modalButtonText, { color: theme.colors.textSecondary }]}>
              {uiStrings[systemLang].cancel || 'Cancel'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modalButton, styles.confirmButton, { backgroundColor: theme.colors.danger || '#dc3545' }]} // Use a danger color
            onPress={confirmExitGame}
          >
            <Text style={[styles.modalButtonText, { color: '#fff' }]}>
              {uiStrings[systemLang].exit || 'Exit'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
  {/* End Exit Confirmation Modal */}
    </View>
  );
}