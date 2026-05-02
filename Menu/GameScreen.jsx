import SmalBoard from '../GameComponents/SmalBoard.jsx';
import { MaterialIcons } from '@expo/vector-icons';
import Goals from '../GameComponents/Goals.jsx';
import Bases from '../GameComponents/Bases.jsx';
import Timer from '../GameComponents/Timer.jsx';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, Pressable, ActivityIndicator, Modal, Animated, AppState } from 'react-native';
import { setActivePlayer, setActivePlayerDirect, setCurrentPlayer, moveSoldier, resetTimer, setIsOnline, resetGameState, setCurrentPlayerColor, setPlayerColors, setPausedGame } from '../assets/store/gameSlice.jsx';
import { resetAnimationState } from '../assets/store/animationSlice.jsx';
import { uiStrings, getLocalizedColor } from '../assets/shared/hardCodedData.js';

import { useWebSocket } from '../assets/shared/webSocketConnection.jsx'; // Import useWebSocket
import { setCurrentUserPage } from '../assets/store/authSlice.jsx';
import { fetchCurrentMatch, leaveMatch, updateMatch } from '../assets/store/sessionSlice.jsx';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { createGameScreenStyles } from './GameScreen.styles.js';
import Instructions from './Instructions.jsx';
import TutorialGuide from '../GameComponents/TutorialGuide.jsx';
import { cancelPendingBotTurn, emitMultiplayerBotTurn, getBotDifficultyForTurn, isBotControlledPlayer, runBotTurn } from './botLogic.js';
import { playSound } from '../assets/shared/audioManager';
import DisconnectionOverlay from '../GameComponents/DisconnectionOverlay.jsx';
import { isE2EMode } from '../assets/store/sessionApiShared.jsx';
import {
  clearTutorialReopen,
  markTutorialAction,
  setCompletedOnce,
  skipTutorial,
  startTutorial,
} from '../assets/store/tutorialSlice.jsx';
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
  const disconnectedPlayer = useSelector(state => state.game.disconnectedPlayer);
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
  const tutorialState = useSelector((state) => state.tutorial || {
    active: false,
    currentStep: 0,
    completedOnce: false,
    reopenRequested: false,
  });
  const tutorialActive = tutorialState.active;
  const tutorialStep = tutorialState.currentStep;
  const tutorialCompletedOnce = tutorialState.completedOnce;
  const tutorialReopenRequested = tutorialState.reopenRequested;

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
  const presencePauseRef = useRef(false);
  const presenceStateRef = useRef(isAppStateActive(AppState.currentState) ? 'active' : 'inactive');
  const disconnectedPlayerRef = useRef(disconnectedPlayer);
  const lastActivePlayerRef = useRef(activePlayer);
  const botTurnLockRef = useRef(null);
  const tutorialCaptureSetupDoneRef = useRef(false);
  const tutorialWasActiveRef = useRef(false);
  const forceTutorialStartConsumedRef = useRef(false);

  // Memoize styles to avoid recreating on every render
  const styles = useMemo(() => createGameScreenStyles(theme), [theme]);

   useEffect(() => {
    setTimeout(() => {
      if(!currentMatch?.id && !connected) return;
     requestFullSync(currentMatch?.id);
    }, 1000);


   }, [currentMatch?.id]);
  // Get the game mode from navigation params
  const {
    mode,
    playerColors: routePlayerColors,
    botDifficulty: routeBotDifficulty,
    forceTutorial: routeForceTutorial,
  } = route.params || { mode: 'local', matchId: 1 };
  const isTutorialEligibleMode = mode === 'bot' || mode === 'local';
  const shouldAutoStartTutorial = mode === 'bot';
  const shouldForceTutorialStart = Boolean(routeForceTutorial);
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
    disconnectedPlayerRef.current = disconnectedPlayer;
  }, [disconnectedPlayer]);

  const buildPresencePayload = useCallback((type) => {
    if (mode !== 'multiplayer' || !currentMatch?.id || !user?.id) {
      return null;
    }

    return {
      type,
      userId: user.id,
      sender: user.name,
      colors: Array.isArray(currentPlayerColor) ? currentPlayerColor : [currentPlayerColor].filter(Boolean),
    };
  }, [currentMatch?.id, currentPlayerColor, mode, user?.id, user?.name]);

  const syncCurrentMatchMembership = useCallback(async () => {
    if (mode !== 'multiplayer' || !currentMatch?.id || !user?.id) {
      return;
    }

    try {
      const refreshedMatch = await dispatch(fetchCurrentMatch(currentMatch.id)).unwrap();
      dispatch(updateMatch(refreshedMatch));

      const isStillInMatch = Array.isArray(refreshedMatch?.users)
        && refreshedMatch.users.some((matchUser) => String(matchUser.id) === String(user.id));

      if (!isStillInMatch) {
        dispatch(setPausedGame(false));
        dispatch(setIsOnline(false));
        navigation.replace('Home');
      }
    } catch (error) {
      console.warn('Failed to refresh match membership:', error);
    }
  }, [currentMatch?.id, dispatch, mode, navigation, user?.id]);

  const handlePresenceChange = useCallback((appIsActive) => {
    setIsAppActive(appIsActive);

    if (presenceStateRef.current === (appIsActive ? 'active' : 'inactive')) {
      return;
    }

    presenceStateRef.current = appIsActive ? 'active' : 'inactive';

    if (!appIsActive) {
      cancelPendingBotTurn();

      if (!exitInProgressRef.current) {
        presencePauseRef.current = true;
        dispatch(setPausedGame(true));
      }

      const inactivePayload = buildPresencePayload('userInactive');
      if (inactivePayload) {
        sendMessage(`/app/waitingRoom.gameStarted/${currentMatch.id}`, inactivePayload);
      }

      return;
    }

    const backPayload = buildPresencePayload('userBack');
    if (backPayload) {
      sendMessage(`/app/waitingRoom.gameStarted/${currentMatch.id}`, backPayload);
      syncCurrentMatchMembership();
    }

    if (presencePauseRef.current && !disconnectedPlayerRef.current && !exitInProgressRef.current) {
      presencePauseRef.current = false;
      dispatch(setPausedGame(false));
    }
  }, [buildPresencePayload, currentMatch?.id, dispatch, sendMessage, syncCurrentMatchMembership]);

  useEffect(() => {
    let mounted = true;
    screenActiveRef.current = true;
    exitInProgressRef.current = false;
    presencePauseRef.current = false;
    presenceStateRef.current = isAppStateActive(AppState.currentState) ? 'active' : 'inactive';

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
      handlePresenceChange(isAppStateActive(nextState));
    });

    return () => subscription.remove();
  }, [handlePresenceChange]);

  useEffect(() => {
    if (globalThis.window === undefined || typeof globalThis.window.addEventListener !== 'function') {
      return undefined;
    }

    const handleVisibilityChange = () => {
      if (globalThis.document === undefined) return;
      handlePresenceChange(globalThis.document.visibilityState === 'visible');
    };

    const handleBeforeUnload = () => {
      exitInProgressRef.current = true;
      cancelPendingBotTurn();
      dispatch(setPausedGame(true));
    };

    globalThis.document.addEventListener('visibilitychange', handleVisibilityChange);
    globalThis.window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      globalThis.document.removeEventListener('visibilitychange', handleVisibilityChange);
      globalThis.window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dispatch, handlePresenceChange]);

  useEffect(() => {
    if (gamePaused || !isAppActive) {
      cancelPendingBotTurn();
    }
  }, [gamePaused, isAppActive]);

  useEffect(() => {
    const currentActivePlayer = activePlayer;
    if (lastActivePlayerRef.current !== currentActivePlayer) {
      dispatch(markTutorialAction({ type: 'turn_changed', activePlayer: currentActivePlayer }));
      lastActivePlayerRef.current = currentActivePlayer;
    }
  }, [activePlayer, dispatch]);

  useEffect(() => {
    if (!tutorialActive || tutorialStep !== 4) {
      tutorialCaptureSetupDoneRef.current = false;
      return;
    }

    if (tutorialCaptureSetupDoneRef.current) {
      return;
    }

    tutorialCaptureSetupDoneRef.current = true;
    dispatch(moveSoldier({ color: 'red', soldierID: 5, position: '4a', onBoard: true }));
    dispatch(setActivePlayerDirect('blue'));

    const selectedBlueSoldier =
      blueSoldiers.find((soldier) => soldier.onBoard && !soldier.isOut && soldier.position === '1a')
      || blueSoldiers.find((soldier) => soldier.onBoard && !soldier.isOut)
      || null;

    if (selectedBlueSoldier) {
      dispatch(setCurrentPlayer(selectedBlueSoldier));
    }

    dispatch(resetTimer());
  }, [blueSoldiers, dispatch, tutorialActive, tutorialStep]);

  useEffect(() => {
    if (tutorialActive) {
      tutorialWasActiveRef.current = true;
    }
  }, [tutorialActive]);

  useEffect(() => {
    setGameIsStarted(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!gameIsStarted || tutorialActive) {
      return undefined;
    }

    if (!isTutorialEligibleMode) {
      if (tutorialReopenRequested) {
        dispatch(clearTutorialReopen());
      }
      return undefined;
    }

    const tutorialStorageKey = user?.id
      ? `ludo_tutorial_completed_${user.id}`
      : 'ludo_tutorial_completed_guest';

    if (tutorialReopenRequested) {
      dispatch(startTutorial());
      dispatch(clearTutorialReopen());
      return undefined;
    }

    if (shouldForceTutorialStart && !forceTutorialStartConsumedRef.current) {
      forceTutorialStartConsumedRef.current = true;
      dispatch(startTutorial());
      return undefined;
    }

    if (tutorialCompletedOnce) {
      return undefined;
    }

    if (!shouldAutoStartTutorial) {
      return undefined;
    }

    let isCancelled = false;
    const loadTutorialState = async () => {
      try {
        const stored = await AsyncStorage.getItem(tutorialStorageKey);
        if (isCancelled) return;

        if (stored === 'true') {
          dispatch(setCompletedOnce(true));
          return;
        }

        dispatch(startTutorial());
      } catch (error) {
        if (!isCancelled) {
          console.warn('Failed to load tutorial completion state:', error);
          dispatch(startTutorial());
        }
      }
    };

    loadTutorialState();

    return () => {
      isCancelled = true;
    };
  }, [
    dispatch,
    gameIsStarted,
    tutorialActive,
    tutorialCompletedOnce,
    tutorialReopenRequested,
    isTutorialEligibleMode,
    shouldForceTutorialStart,
    shouldAutoStartTutorial,
    user?.id,
  ]);

  useEffect(() => {
    if (!isTutorialEligibleMode) {
      return;
    }

    if (!tutorialCompletedOnce) {
      return;
    }

    const tutorialStorageKey = user?.id
      ? `ludo_tutorial_completed_${user.id}`
      : 'ludo_tutorial_completed_guest';

    AsyncStorage.setItem(tutorialStorageKey, 'true').catch(() => {
      // Ignore persistence failure and keep gameplay responsive.
    });
  }, [isTutorialEligibleMode, tutorialCompletedOnce, user?.id]);

  useEffect(() => {
    if (!isTutorialEligibleMode || tutorialActive || !tutorialCompletedOnce || !tutorialWasActiveRef.current) {
      return;
    }

    tutorialWasActiveRef.current = false;
    navigation.replace('Game', { mode, botDifficulty: routeBotDifficulty });
  }, [isTutorialEligibleMode, tutorialActive, tutorialCompletedOnce, mode, routeBotDifficulty, navigation]);

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
  const shouldRunLocalE2EMultiplayerBotTurn = useMemo(
    () => mode === 'multiplayer' && isE2EMode && !connected && isHost && isMultiplayerBotTurn,
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
  const currentBotTurnKey = useMemo(() => {
    if (isOfflineBotTurn || shouldEmitMultiplayerBotTurn || shouldRunLocalE2EMultiplayerBotTurn) {
      return `${mode}:${activePlayer}`;
    }

    return null;
  }, [
    activePlayer,
    isOfflineBotTurn,
    mode,
    shouldEmitMultiplayerBotTurn,
    shouldRunLocalE2EMultiplayerBotTurn,
  ]);

  useEffect(() => {
    if (!currentBotTurnKey || botTurnLockRef.current !== currentBotTurnKey) {
      botTurnLockRef.current = null;
    }
  }, [currentBotTurnKey]);

  useEffect(() => {
    if (winnerDetected || loading || shouldPauseBotActions()) return;
    if (!currentBotTurnKey) return;
    if (botTurnLockRef.current === currentBotTurnKey) return;

    const botTimer = setTimeout(() => {
      if (shouldPauseBotActions()) return;

      if (isOfflineBotTurn || shouldRunLocalE2EMultiplayerBotTurn) {
        botTurnLockRef.current = currentBotTurnKey;

        Promise.resolve(runBotTurn({
          color: activePlayer,
          difficulty: botDifficulty,
          activePlayer,
          systemLang,
          showClone,
          dispatch,
          cardsByColor,
          soldiersByColor,
          shouldCancel: shouldPauseBotActions,
        }))
          .then((action) => {
            if (action === null && botTurnLockRef.current === currentBotTurnKey) {
              botTurnLockRef.current = null;
            }
          })
          .catch(() => {
            if (botTurnLockRef.current === currentBotTurnKey) {
              botTurnLockRef.current = null;
            }
          });
        return;
      }

      if (!currentMatch?.id || !user?.id) {
        return;
      }

      botTurnLockRef.current = currentBotTurnKey;

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
    currentBotTurnKey,
    currentMatch,
    dispatch,
    gamePaused,
    isOfflineBotTurn,
    isAppActive,
    loading,
    sendMatchCommand,
    sendMessage,
    shouldEmitMultiplayerBotTurn,
    shouldRunLocalE2EMultiplayerBotTurn,
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
      }}

      const shouldHandleSkipLocally = mode === 'local'
        || (mode === 'multiplayer' && isE2EMode && !connected)
        || (mode === 'bot' && activePlayer === 'blue');

      if(shouldHandleSkipLocally) {
        dispatch(setActivePlayer());
        dispatch(resetTimer());
      }
    
    }

  const handleExitGame = () => {
    setShowExitModal(true);
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
      {!tutorialActive && <Instructions mode={mode} />}
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
      <TutorialGuide
        visible={isTutorialEligibleMode && tutorialActive}
        step={tutorialStep}
        onSkip={() => dispatch(skipTutorial())}
      />
      <DisconnectionOverlay navigation={navigation} />
    </View>
  );
}
