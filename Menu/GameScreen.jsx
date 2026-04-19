import SmalBoard from '../GameComponents/SmalBoard.jsx';
import { MaterialIcons } from '@expo/vector-icons';
import Goals from '../GameComponents/Goals.jsx';
import Bases from '../GameComponents/Bases.jsx';
import Timer from '../GameComponents/Timer.jsx';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, Pressable, ActivityIndicator, Modal, Animated, AppState } from 'react-native';
import { setActivePlayer, resetTimer, setIsOnline, resetGameState, setCurrentPlayerColor, setPlayerColors, setPausedGame } from '../assets/store/gameSlice.jsx';
import { resetAnimationState } from '../assets/store/animationSlice.jsx';
import { uiStrings, getLocalizedColor } from '../assets/shared/hardCodedData.js';

import { useWebSocket } from '../assets/shared/webSocketConnection.jsx'; // Import useWebSocket
import { setCurrentUserPage } from '../assets/store/authSlice.jsx';
import { leaveMatch, updateMatch } from '../assets/store/sessionSlice.jsx';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { createGameScreenStyles } from './GameScreen.styles.js';
import Instructions from './Instructions.jsx';
import { cancelPendingBotTurn, emitMultiplayerBotTurn, getBotDifficultyForTurn, isBotControlledPlayer, runBotTurn } from './botLogic.js';
import { playSound } from '../assets/shared/audioManager';
import DisconnectionOverlay from '../GameComponents/DisconnectionOverlay.jsx';
import {
  buildPlayerColorsFromPlayers,
  getUserColorFromPlayerColors,
  getUserColorsFromPlayerColors,
  getWinnerSummary,
  isAppStateActive,
} from './GameScreen.logic.js';

export default function GameScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const currentMatch = useSelector(state => state.session.currentMatch);
  const user = useSelector(state => state.auth.user);
  const playerColors = useSelector(state => state.game.playerColors);
  const activePlayer = useSelector(state => state.game.activePlayer);
  const isOnline = useSelector(state => state.game.isOnline);
  const gamePaused = useSelector(state => state.game.gamePaused);
  const currentPlayerColor = useSelector(state => state.game.currentPlayerColor);
  const blueSoldiers = useSelector(state => state.game.blueSoldiers);
  const redSoldiers = useSelector(state => state.game.redSoldiers);
  const yellowSoldiers = useSelector(state => state.game.yellowSoldiers);
  const greenSoldiers = useSelector(state => state.game.greenSoldiers);
  const blueCards = useSelector(state => state.game.blueCards);
  const redCards = useSelector(state => state.game.redCards);
  const yellowCards = useSelector(state => state.game.yellowCards);
  const greenCards = useSelector(state => state.game.greenCards);
  const showClone = useSelector(state => state.animation?.showClone || false);

  const [gameIsStarted, setGameIsStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false); // <-- Add this state
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerResults, setWinnerResults] = useState([]);
  const [winningColor, setWinningColor] = useState(null);
  const [winnerDetected, setWinnerDetected] = useState(false);
  const [isAppActive, setIsAppActive] = useState(isAppStateActive(AppState.currentState));
  const winnerScale = useRef(new Animated.Value(0.7)).current;
  const keepAwakeActivatedRef = useRef(false);
  const screenActiveRef = useRef(true);
  const exitInProgressRef = useRef(false);

  // Memoize styles to avoid recreating on every render
  const styles = useMemo(() => createGameScreenStyles(theme), [theme]);

  // Get the game mode from navigation params
  const {
    mode,
    playerColors: routePlayerColors,
    botDifficulty: routeBotDifficulty,
  } = route.params || { mode: 'local', matchId: 1 };
  const { connected, sendMessage, sendMatchCommand, requestFullSync } = useWebSocket();
  const multiplayerPlayerColors = useMemo(
    () => routePlayerColors || buildPlayerColorsFromPlayers(currentMatch?.users),
    [currentMatch?.users, routePlayerColors]
  );
  const isHost = useMemo(
    () => Boolean(currentMatch && user && String(currentMatch.users?.[0]?.id) === String(user.id)),
    [currentMatch, user]
  );
  const shouldPauseBotActions = () => (
    gamePaused
    || !screenActiveRef.current
    || !isAppActive
    || exitInProgressRef.current
  );

  useEffect(() => {
    let mounted = true;
    screenActiveRef.current = true;
    exitInProgressRef.current = false;

    setCurrentUserPage('Game');
    dispatch(resetGameState());
    dispatch(resetAnimationState());

    if (isOnline == false) {
      dispatch(setActivePlayer("blue"));
      dispatch(setCurrentPlayerColor("blue"));
    }
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
      screenActiveRef.current = false;
      exitInProgressRef.current = true;
      cancelPendingBotTurn();
      dispatch(setPausedGame(true));
      // Deactivate keep awake when leaving the GameScreen
      if (!keepAwakeActivatedRef.current) return;
      deactivateKeepAwake().catch((error) => {
        console.warn('Failed to deactivate keep-awake on game screen:', error);
      });
    };
  }, [dispatch]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const appIsActive = isAppStateActive(nextState);
      setIsAppActive(appIsActive);

      if (!appIsActive) {
        cancelPendingBotTurn();
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
      return undefined;
    }

    const handleBeforeUnload = () => {
      exitInProgressRef.current = true;
      cancelPendingBotTurn();
      dispatch(setPausedGame(true));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dispatch]);

  useEffect(() => {
    if (gamePaused || !isAppActive) {
      cancelPendingBotTurn();
    }
  }, [gamePaused, isAppActive]);

  useEffect(() => {
    setGameIsStarted(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (mode === 'multiplayer' && multiplayerPlayerColors) {
      dispatch(setPlayerColors(multiplayerPlayerColors));
      dispatch(setCurrentPlayerColor(getUserColorsFromPlayerColors(user?.id, multiplayerPlayerColors)));
      dispatch(setIsOnline(true));
      setGameIsStarted(true);
    }
  }, [dispatch, mode, multiplayerPlayerColors, user?.id]);

  useEffect(() => {
    if (mode === 'bot') {
      dispatch(setCurrentPlayerColor('blue'));
      return;
    }

    if (mode === 'local') {
      dispatch(setCurrentPlayerColor(activePlayer));
    }
  }, [mode, activePlayer, dispatch]);

  const cardsByColor = useMemo(() => ({
    blue: blueCards,
    red: redCards,
    yellow: yellowCards,
    green: greenCards,
  }), [blueCards, redCards, yellowCards, greenCards]);

  const soldiersByColor = useMemo(() => ({
    blue: blueSoldiers,
    red: redSoldiers,
    yellow: yellowSoldiers,
    green: greenSoldiers,
  }), [blueSoldiers, redSoldiers, yellowSoldiers, greenSoldiers]);

  const isMultiplayerBotTurn = useMemo(
    () => mode === 'multiplayer' && isBotControlledPlayer(currentMatch?.users, playerColors, activePlayer),
    [activePlayer, currentMatch?.users, mode, playerColors]
  );
  const isOfflineBotTurn = useMemo(
    () => mode === 'bot' && activePlayer !== 'blue',
    [activePlayer, mode]
  );
  const shouldEmitMultiplayerBotTurn = useMemo(
    () => mode === 'multiplayer' && connected && isHost && isMultiplayerBotTurn,
    [connected, isHost, isMultiplayerBotTurn, mode]
  );
  const botDifficulty = useMemo(
    () => getBotDifficultyForTurn({
      mode,
      routeBotDifficulty,
      users: currentMatch?.users,
      playerColors,
      activePlayer,
    }),
    [activePlayer, currentMatch?.users, mode, playerColors, routeBotDifficulty]
  );
  const canSyncGameState = mode === 'multiplayer' && connected && Boolean(currentMatch?.id);

  useEffect(() => {
    if (winnerDetected || loading || shouldPauseBotActions()) return;
    if (!isOfflineBotTurn && !shouldEmitMultiplayerBotTurn) return;

    const botTimer = setTimeout(() => {
      if (shouldPauseBotActions()) return;

      if (isOfflineBotTurn) {
        runBotTurn({
          color: activePlayer,
          difficulty: botDifficulty,
          activePlayer,
          systemLang,
          showClone,
          dispatch,
          cardsByColor,
          soldiersByColor,
          shouldCancel: shouldPauseBotActions,
        });
        return;
      }

      emitMultiplayerBotTurn({
        color: activePlayer,
        difficulty: botDifficulty,
        cardsByColor,
        soldiersByColor,
        connected,
        currentMatch,
        user,
        sendMessage,
        sendMatchCommand,
        shouldCancel: shouldPauseBotActions,
      });
    }, 1000);

    return () => clearTimeout(botTimer);
  }, [
    activePlayer,
    botDifficulty,
    cardsByColor,
    connected,
    currentMatch,
    dispatch,
    gamePaused,
    isOfflineBotTurn,
    isAppActive,
    loading,
    sendMatchCommand,
    sendMessage,
    shouldEmitMultiplayerBotTurn,
    showClone,
    soldiersByColor,
    systemLang,
    user,
    winnerDetected,
  ]);

  useEffect(() => {
    if (winnerDetected || loading) return;

    const winnerSummary = getWinnerSummary({
      blue: blueSoldiers,
      red: redSoldiers,
      yellow: yellowSoldiers,
      green: greenSoldiers,
    });

    if (!winnerSummary) return;

    setWinningColor(winnerSummary.winningColor);
    setWinnerResults(winnerSummary.winnerResults);
    setShowWinnerModal(true);
    setWinnerDetected(true);
    playSound('win').catch(() => {});
    Animated.spring(winnerScale, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [blueSoldiers, redSoldiers, yellowSoldiers, greenSoldiers, loading, winnerDetected, winnerScale]);

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

  const skipTurn = () => {
    if (connected) {
      const userColor = getUserColorFromPlayerColors(user?.id, playerColors);
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
    setShowExitModal(true);
  };

  const handleSyncGameState = () => {
    if (!canSyncGameState) return;
    requestFullSync(currentMatch?.id);
  };

  const confirmExitGame = async () => {
    setShowExitModal(false); // Close the modal
    exitInProgressRef.current = true;
    cancelPendingBotTurn();
    dispatch(setPausedGame(true));

    if (mode === 'local') {
      navigation.replace('Home');
    } else {
      await handleLeaveMatch();
      navigation.replace('Home');
    }
  };

  const handleLeaveMatch = async () => {
    if (currentMatch && currentMatch.id) {
      sendMessage(`/app/waitingRoom.gameStarted/${currentMatch.id}`, { type: 'userLeft', userId: user.id, colors: currentPlayerColor })
      try {
        await dispatch(leaveMatch({ matchId: currentMatch.id, playerId: user.id })).unwrap();
      } catch (error) {
        console.error('Failed to leave match:', error);
      } finally {
        cancelPendingBotTurn();
        dispatch(setIsOnline(false));
        dispatch(updateMatch(null));
      }
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
      <Instructions mode={mode} />
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
                handleSyncGameState();
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
      {/* Winner Popup Modal */}
      <Modal
        visible={showWinnerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWinnerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.winnerModalCard, { transform: [{ scale: winnerScale }] }]}> 
            <Text style={styles.winnerHeader}>
              🎉 {uiStrings[systemLang].wonGame ? uiStrings[systemLang].wonGame.replace('{color}', getLocalizedColor(winningColor, systemLang)) : `${getLocalizedColor(winningColor, systemLang)} won the Game`} 🎉
            </Text>
            <Text style={styles.winnerSubtitle}>
              {uiStrings[systemLang].topRankings || 'Top rankings'}
            </Text>
            <View style={styles.winnerList}>
              {winnerResults.map((result, index) => (
                <View key={result.color} style={styles.winnerItem}>
                  <View style={[styles.winnerBadge, { backgroundColor: theme.colors[result.color] || '#888' }]}>
                    <Text style={styles.winnerBadgeText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.winnerItemText} selectable>
                    {getLocalizedColor(result.color, systemLang)} • {result.completed} {uiStrings[systemLang].completedSoldiers || 'completed'}
                  </Text>
                </View>
              ))}
            </View>
            <Pressable style={[styles.modalButton, styles.confirmButton, styles.winnerCloseButton]} onPress={() => setShowWinnerModal(false)}>
              <Text style={[styles.modalButtonText, { color: '#fff' }]}> 
                {uiStrings[systemLang].gotIt || 'Got it'}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

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
                testID="game-exit-cancel-button"
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelExitGame}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.textSecondary }]}>
                  {uiStrings[systemLang].cancel || 'Cancel'}
                </Text>
              </Pressable>
              <Pressable
                testID="game-exit-confirm-button"
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
      <DisconnectionOverlay navigation={navigation} />
    </View>
  );
}
