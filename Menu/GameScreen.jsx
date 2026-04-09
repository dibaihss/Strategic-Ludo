import SmalBoard from '../GameComponents/SmalBoard.jsx';
import { MaterialIcons } from '@expo/vector-icons';
import Goals from '../GameComponents/Goals.jsx';
import Bases from '../GameComponents/Bases.jsx';
import Timer from '../GameComponents/Timer.jsx';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, Pressable, ActivityIndicator, Modal } from 'react-native';
import { setActivePlayer, resetTimer, setOnlineModus, resetGameState, setCurrentPlayerColor } from '../assets/store/gameSlice.jsx';
import { uiStrings } from '../assets/shared/hardCodedData.js';

import { useWebSocket } from '../assets/shared/webSocketConnection.jsx'; // Import useWebSocket
import { setCurrentUserPage } from '../assets/store/authSlice.jsx';
import { leaveMatch } from '../assets/store/sessionSlice.jsx';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { createGameScreenStyles } from './GameScreen.styles.js';

export default function GameScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const currentMatch = useSelector(state => state.session.currentMatch);
  const user = useSelector(state => state.auth.user);
  const playerColors = useSelector(state => state.game.playerColors);
  const activePlayer = useSelector(state => state.game.activePlayer);
  const currentPlayerColor = useSelector(state => state.game.currentPlayerColor);

  const [gameIsStarted, setGameIsStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false); // <-- Add this state
  const keepAwakeActivatedRef = useRef(false);

  // Memoize styles to avoid recreating on every render
  const styles = useMemo(() => createGameScreenStyles(theme), [theme]);

  // Get the game mode from navigation params
  const { mode, matchId } = route.params || { mode: 'local', matchId: 1 };
  const { connected, sendMessage, sendMatchCommand } = useWebSocket();

  useEffect(() => {
    let mounted = true;

    if (mode === "local") {
      setOnlineModus(false);
    }
    setCurrentUserPage('Game');
    dispatch(resetGameState());

    // Keep the device awake when the user is on the GameScreen
    activateKeepAwakeAsync()
      .then(() => {
        if (mounted) {
          keepAwakeActivatedRef.current = true;
        }
      })
      .catch((error) => {
        console.error('Failed to activate keep-awake on game screen:', error);
      });

    return () => {
      mounted = false;
      // Deactivate keep awake when leaving the GameScreen
      if (!keepAwakeActivatedRef.current) return;
      deactivateKeepAwake().catch((error) => {
        console.warn('Failed to deactivate keep-awake on game screen:', error);
      });
    };
  }, []);

  useEffect(() => {
    console.log(playerColors)

    console.log(user)
    setGameIsStarted(true);
    setLoading(false);
  }, [mode, matchId, dispatch]);

  useEffect(() => {
    if (mode === 'multiplayer' && currentMatch && currentMatch.users) {
      const players = currentMatch.users;
      setOnlineModus(true);
      if (players.length >= 2) {
        dispatch(setCurrentPlayerColor(findUserColors()))
        dispatch(setOnlineModus(true));
        setGameIsStarted(true);
      }
    }
  }, [currentMatch?.users, mode, dispatch]);

  const sendMoveUpdate = (message) => {
    if (connected && message?.type) {
      sendMatchCommand({
        type: message.type,
        payload: message.payload || {},
        matchId: currentMatch?.id,
        playerId: user?.id,
      });
      return;
    }
    sendMessage(`/app/player.Move/${currentMatch.id}`, message);
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
    const userEntries = Object.entries(playerColors).filter(([color, userId]) => userId === user.id);
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
      dispatch(leaveMatch({ matchId: currentMatch.id, playerId: user.id }))
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          {uiStrings[systemLang].loadingGame || 'Loading game...'}
        </Text>
      </View>
    );
  }

  return (
    <View testID="game-screen" style={styles.container}>
      {gameIsStarted ? (
        <>
          <Timer />
          <SmalBoard />
          <Goals />
          <Bases />
          <View style={styles.controls}>
            <Pressable
              testID="game-skip-turn-button"
              style={styles.button}
              onPress={() => {
                skipTurn();
              }}
            >
              <MaterialIcons name="casino" size={24} color={theme.colors.buttonText} />
              <Text style={styles.buttonText}>
                {uiStrings[systemLang].skipButton || 'Skip Turn'}
              </Text>
            </Pressable>

            <Pressable
              testID="game-exit-button"
              style={styles.button}
              onPress={handleExitGame}
            >
              <MaterialIcons name="exit-to-app" size={24} color={theme.colors.buttonText} />
              <Text style={styles.buttonText}>
                {uiStrings[systemLang].exitGame || 'Exit'}
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {uiStrings[systemLang].waitingForPlayers || 'Waiting for enough players to join...'}
          </Text>
          <Pressable
            style={[styles.button, { marginTop: 20 }]}
            onPress={handleExitGame}
          >
            <Text style={styles.buttonText}>
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
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {uiStrings[systemLang].exitGameTitle || 'Exit Game?'}
            </Text>
            <Text style={styles.modalMessage}>
              {uiStrings[systemLang].exitGameConfirm || 'Are you sure you want to leave the current game?'}
            </Text>
            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelExitGame}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.textSecondary }]}>
                  {uiStrings[systemLang].cancel || 'Cancel'}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
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
