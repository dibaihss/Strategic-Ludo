import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { createWaitingRoomStyles } from './WaitingRoom.styles.js';
import { useDispatch, useSelector } from 'react-redux';
import { addBotToMatch, fetchCurrentMatch, updateMatch, updateMatchStatus, leaveMatch } from '../assets/store/sessionSlice.jsx';
import { setPlayerColors, updateSoldiersPosition, removeColorFromAvailableColors, setActivePlayer } from '../assets/store/gameSlice.jsx';
import { uiStrings } from '../assets/shared/hardCodedData.js';
import { useWebSocket } from '../assets/shared/webSocketConnection.jsx';
import Toast from 'react-native-toast-message';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WaitingRoom = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const styles = useMemo(() => createWaitingRoomStyles(theme), [theme]);
  const systemLang = useSelector(state => state.language.systemLang);
  const currentMatch = useSelector(state => state.session.currentMatch);
  const user = useSelector(state => state.auth.user);
  const loading = useSelector(state => state.session.loading);

  const [count, setCount] = useState(3);
  const intervalRef = useRef(null);

  const [refreshing, setRefreshing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const keepAwakeActivatedRef = useRef(false);
  const [showBotDifficultyPrompt, setShowBotDifficultyPrompt] = useState(false);


  const { connected, subscribe, sendMessage } = useWebSocket();

  const [showCountdown, setShowCountdown] = useState(false)

  let join = route.params?.join || false;
  const players = Array.isArray(currentMatch?.users) ? currentMatch.users : [];
  const botCount = players.filter((player) => player?.isBot).length;
  const isHost = Boolean(currentMatch && user && String(currentMatch.users?.[0]?.id) === String(user.id));
  const canAddBot = isHost && !showCountdown && players.length < 4 && botCount < 3;

  useEffect(() => {
    let mounted = true;

    // Keep the device awake when the user is in the WaitingRoom
    activateKeepAwakeAsync()
      .then(() => {
        if (mounted) {
          keepAwakeActivatedRef.current = true;
        }
      })
      .catch((error) => {
        console.error('Failed to activate keep-awake:', error);
      });

    return () => {
      mounted = false;
      // Deactivate keep awake when leaving the WaitingRoom
      if (!keepAwakeActivatedRef.current) return;
      deactivateKeepAwake().catch((error) => {
        console.warn('Failed to deactivate keep-awake:', error);
      });
    };
  }, []);

  useEffect(() => {
    if (showCountdown) {
      setCount(3);

      // Start the countdown
      intervalRef.current = setInterval(() => {
        setCount(prevCount => {
          if (prevCount <= 1) {
            // When countdown reaches 0, clear interval and start game
            clearInterval(intervalRef.current);
            handleStartGame();
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);

      // Cleanup function
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [showCountdown]); // Only re-run this effect when showCountdown changes


  // Modify your WebSocket subscription effect
  useEffect(() => {
    if (!currentMatch || !currentMatch.id) return;
    if (connected) {
      // Check if the user is already in the match
      const subscription = subscribe(`/topic/gameStarted/${currentMatch.id}`, async (data) => {

        console.log("WebSocket data received:", data);
        if (data.type === 'startGame') {
          setShowCountdown(true);

        }
        if (data.type === 'userInactive') {
          if (user.id !== data.userId) {
            debounceHandleRefresh();
          }
        } else if (data.type === 'userBack') {
          debounceHandleRefresh();
        } else if (data.type === 'userJoined') {
          debounceHandleRefresh();
        } else if (data.type === 'botAdded') {
          if (data.bot) {
            dispatch(addBotToMatch({ matchId: currentMatch.id, bot: data.bot }));
          }
        } else if (data.type === 'userDisconnected') {
          debounceHandleRefresh();
        } else if (data.type === 'userLeft' || data.type === 'userKicked') {
          if (data.type === "userKicked") console.log("user kicked", data.userId)
          if (user.id !== data.userId) {
            debounceHandleRefresh();
            // remove player soldier and player turn
            if (data.colors) {
              data.colors.forEach(color => {
                dispatch(updateSoldiersPosition({ color, position: "" }));
                dispatch(removeColorFromAvailableColors({ color }))
                dispatch(setActivePlayer())

              });
            }
          }
        }

      });

      if (joinRef.current) {
        joinRef.current = false;
        sendMessage(`/app/waitingRoom.gameStarted/${currentMatch.id}`, { type: 'userJoined', userId: user.id });
      }
      // Cleanup subscription when component unmounts
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [subscribe, currentMatch?.id, connected]);

  // Debounce handleRefresh
  const debounceHandleRefresh = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      handleRefresh();
    }, 500); // Debounce interval (500ms)
  };

  // Ref for join
  const joinRef = useRef(join);
  const refreshTimeoutRef = useRef(null);

  const handleAddBot = () => {
    if (!currentMatch?.id || !isHost) return;

    if (!canAddBot) {
      const message = players.length >= 4
        ? (uiStrings[systemLang].lobbyFull || 'Lobby is full')
        : (uiStrings[systemLang].maxBotsReached || 'You can add up to 3 bots');
      Toast.show({
        type: 'info',
        text1: uiStrings[systemLang].addBot || 'Add Bot',
        text2: message,
      });
      return;
    }

    setShowBotDifficultyPrompt(true);
  };

  const handleCancelBotDifficultyPrompt = () => {
    setShowBotDifficultyPrompt(false);
  };

  const handleChooseBotDifficulty = (botDifficulty) => {
    setShowBotDifficultyPrompt(false);

    const nextBotNumber = botCount + 1;
    const bot = {
      id: `bot-${currentMatch.id}-${nextBotNumber}`,
      name: `${uiStrings[systemLang].bot || 'Bot'} ${nextBotNumber}`,
      username: `${uiStrings[systemLang].bot || 'Bot'} ${nextBotNumber}`,
      isBot: true,
      isGuest: true,
      botDifficulty,
    };

    dispatch(addBotToMatch({ matchId: currentMatch.id, bot }));
    sendMessage(`/app/waitingRoom.gameStarted/${currentMatch.id}`, { type: 'botAdded', bot });
  };

  const handleRefresh = () => {
    if (isFetching) return;
    if (!currentMatch?.id) return;
    const id = currentMatch.id;
    setIsFetching(true);
    setRefreshing(true);
    fetchCurrentMatchData(id);
  };

  const fetchCurrentMatchData = (id) => {
    setTimeout(() => {
      dispatch(fetchCurrentMatch(id))
        .unwrap() // Extract the Promise from the Thunk
        .then(result => {
          // Update the match data in the store
          setRefreshing(false);
          dispatch(updateMatch(result));
          checkIfUserInMatch(result);
          setIsFetching(false);
        })
        .catch(error => {
          console.error("Error refreshing match data:", error);
          setIsFetching(false);
        })
        .finally(() => {
          setIsFetching(false);
        });
    }, 700);
  }

  const checkIfUserInMatch = (match) => {
    if (!match || !match.id) return;
    const users = Array.isArray(match.users) ? match.users : [];
    const userInMatch = users.find(u => u.id === user.id);
    console.log('User in match:', users, userInMatch);
    if (!userInMatch) {
      navigation.navigate('Home');
      dispatch(updateMatch(null))
      return;
    }
  };
  const startGame = () => {
    const users = Array.isArray(currentMatch?.users) ? currentMatch.users : [];
    if (users.length < 2) {
      return;
    }
    sendMessage(`/app/waitingRoom.gameStarted/${currentMatch.id}`, { type: 'startGame' });
  };

  const handleStartGame = async () => {
    if (players.length < 2) return;
    const playerColors = {
      blue: players[0].id,
      red: players[1].id,
      yellow: players[2] ? players[2].id : players[1].id,
      green: players[3] ? players[3].id : players[0].id
    }
    if (currentMatch && currentMatch.status !== 'in_progress') {
      const updatedMatch = {
        ...currentMatch,
        status: 'in_progress',
      };
      dispatch(updateMatchStatus(updatedMatch))
        .unwrap()
        .then(updatedMatch => {
        })
        .catch(error => {
          console.error('Failed to update match status:', error);
        });
    }


    await AsyncStorage.setItem('REDIRECT_TO_GAME', 'true');
    await AsyncStorage.setItem('REDIRECT_GAME_MODE', 'multiplayer');
    await AsyncStorage.setItem('REDIRECT_BOT_DIFFICULTY', 'normal');
    await AsyncStorage.setItem('REDIRECT_MATCH_DATA', JSON.stringify(currentMatch));


    if (typeof window !== 'undefined') {
      window.location.reload();
    } else {
      dispatch(setPlayerColors(playerColors))
      navigation.navigate('Game', {
        mode: 'multiplayer',
        matchId: currentMatch.id,
        playerColors,
      });
    }



    dispatch(setPlayerColors(playerColors))
    navigation.navigate('Game', {
      mode: 'multiplayer',
      matchId: currentMatch.id,
      playerColors,
    });
  };


  const handleLeaveMatch = () => {
    navigation.navigate('Home');
    if (currentMatch && currentMatch.id) {
      dispatch(leaveMatch({ matchId: currentMatch.id, playerId: user.id }))
        .unwrap()
        .then(() => {
          sendMessage(`/app/waitingRoom.gameStarted/${currentMatch.id}`, { type: 'userLeft', userId: user.id })
        })
        .catch(error => {
          console.error('Failed to delete match:', error);
        });
    }
  };

  if (loading && !currentMatch) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          {uiStrings[systemLang].loadingMatch || 'Loading match details...'}
        </Text>
      </View>
    );
  }


  if (!currentMatch) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {uiStrings[systemLang].matchNotFound || 'Match not found!'}
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.button }]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
            {uiStrings[systemLang].backToHome || 'Back to Home'}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View testID="waiting-room-screen" style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Render countdown timer if showCountdown is true */}
      {showCountdown && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>
            {uiStrings[systemLang]?.gameStartingIn || 'Game starting in'}: {count}
          </Text>
        </View>

      )}
      <Modal
        visible={showBotDifficultyPrompt}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelBotDifficultyPrompt}
      >
        <View style={styles.modalOverlay} testID="waiting-room-bot-difficulty-modal">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{uiStrings[systemLang].chooseBotDifficultyTitle}</Text>
            <Text style={styles.modalMessage}>{uiStrings[systemLang].chooseBotDifficultyMessage}</Text>
            <View style={styles.modalButtonsColumn}>
              <Pressable
                testID="waiting-room-bot-difficulty-easy-button"
                style={[styles.addBotButton, { backgroundColor: theme.colors.success, borderColor: theme.colors.border }]}
                onPress={() => handleChooseBotDifficulty('easy')}
              >
                <MaterialIcons name="sentiment-satisfied-alt" size={20} color={theme.colors.buttonText} />
                <Text style={[styles.addBotButtonText, { color: theme.colors.buttonText }]}>
                  {uiStrings[systemLang].easy}
                </Text>
              </Pressable>
              <Pressable
                testID="waiting-room-bot-difficulty-normal-button"
                style={[styles.addBotButton, { backgroundColor: theme.colors.accent, borderColor: theme.colors.border }]}
                onPress={() => handleChooseBotDifficulty('normal')}
              >
                <MaterialIcons name="smart-toy" size={20} color={theme.colors.buttonText} />
                <Text style={[styles.addBotButtonText, { color: theme.colors.buttonText }]}>
                  {uiStrings[systemLang].normal}
                </Text>
              </Pressable>
              <Pressable
                testID="waiting-room-bot-difficulty-hard-button"
                style={[styles.addBotButton, { backgroundColor: theme.colors.error, borderColor: theme.colors.border }]}
                onPress={() => handleChooseBotDifficulty('hard')}
              >
                <MaterialIcons name="bolt" size={20} color={theme.colors.buttonText} />
                <Text style={[styles.addBotButtonText, { color: theme.colors.buttonText }]}>
                  {uiStrings[systemLang].hard}
                </Text>
              </Pressable>
            </View>
            <Pressable
              testID="waiting-room-bot-difficulty-cancel-button"
              style={[styles.secondaryButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
              onPress={handleCancelBotDifficultyPrompt}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                {uiStrings[systemLang].cancel}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {uiStrings[systemLang].waitingRoom || 'Waiting Room'}
        </Text>

        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {uiStrings[systemLang].matchId || 'Match ID'}: {currentMatch.name}
        </Text>
      </View>

      <View style={[styles.playersContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }]}>
        <View style={styles.playersHeader}>
          <Text style={[styles.playersTitle, { color: theme.colors.text }]}>
            {uiStrings[systemLang].players || 'Players'} ({currentMatch.users?.length || 0}/4)
          </Text>

          <Pressable
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <MaterialIcons
              name="refresh"
              size={24}
              color={refreshing ? theme.colors.disabled : theme.colors.accent}
            />
          </Pressable>
        </View>

        {refreshing && (
          <ActivityIndicator
            size="small"
            color={theme.colors.accent}
            style={styles.refreshIndicator}
          />
        )}

        {isHost && (
          <View style={[styles.hostControls, { backgroundColor: theme.colors.inputBackground }]}>
            <Text style={[styles.hostControlsText, { color: theme.colors.textSecondary }]}>
              {uiStrings[systemLang].hostCanAddBots || 'Host can add up to 3 bots'}
            </Text>
            <Pressable
              testID="waiting-room-add-bot-button"
              style={[
                styles.addBotButton,
                {
                  backgroundColor: canAddBot ? theme.colors.accent : theme.colors.disabled,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={handleAddBot}
              disabled={!canAddBot}
            >
              <MaterialIcons name="smart-toy" size={20} color={theme.colors.buttonText} />
              <Text style={[styles.addBotButtonText, { color: theme.colors.buttonText }]}>
                {uiStrings[systemLang].addBot || 'Add Bot'}
              </Text>
            </Pressable>
          </View>
        )}

        <FlatList
          data={players}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <View style={[styles.playerItem, { backgroundColor: theme.colors.inputBackground }]}>
              <View style={styles.playerDetails}>
                <View style={[styles.playerAvatar, { backgroundColor: getPlayerColor(index, theme) }]}>
                  <Text style={styles.playerInitial}>
                    {(item.name || item.username || "User").charAt(0).toUpperCase()}
                  </Text>
                </View>

                <Text style={[styles.playerName, { color: theme.colors.text }]}>
                  {item.name || item.username || "User"}
                  {item.id === user.id && (
                    <Text style={{ color: theme.colors.accent }}> {uiStrings[systemLang].you || '(You)'}</Text>
                  )}
                </Text>
              </View>

              <View style={styles.playerBadges}>
                {item.isBot && (
                  <View style={[styles.botBadge, { backgroundColor: theme.colors.accent }]}>
                    <Text style={[styles.botBadgeText, { color: theme.colors.buttonText }]}>
                      {`${uiStrings[systemLang].bot || 'Bot'} ${uiStrings[systemLang][item.botDifficulty] || uiStrings[systemLang].normal}`}
                    </Text>
                  </View>
                )}
                {index === 0 && (
                  <View style={[styles.hostBadge, { backgroundColor: theme.colors.yellow }]}>
                    <Text style={[styles.hostBadgeText, { color: theme.colors.text }]}>
                      {uiStrings[systemLang].host || 'Host'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {uiStrings[systemLang].noPlayersYet || 'No players have joined yet'}
            </Text>
          }
        />
        {!showCountdown &&
          <View style={styles.joinInfo}>
            <Text style={[styles.joinInfoText, { color: theme.colors.textSecondary }]}>
              {uiStrings[systemLang].waitingForPlayers || 'Waiting for more players to join...'}
            </Text>
            <Text style={[styles.joinInfoText, { color: theme.colors.textSecondary }]}>
              {players.length === 1
                ? uiStrings[systemLang].needMorePlayers || 'Need at least one more player to start'
                : null}
            </Text>
          </View>
        }

      </View>

      <View style={styles.footer}>
        {(players.length >= 2) && (
          <Pressable
            testID="waiting-room-start-button"
            style={[styles.startButton, { backgroundColor: theme.colors.success, borderColor: theme.colors.border }]}
            onPress={startGame}
          >
            <MaterialIcons name="play-arrow" size={24} color={theme.colors.buttonText} />
            <Text style={[styles.startButtonText, { color: theme.colors.buttonText }]}>
              {uiStrings[systemLang].startGame || 'Start Game'}
            </Text>
          </Pressable>
        )}

        <Pressable
          testID="waiting-room-leave-button"
          style={[styles.leaveButton, { backgroundColor: theme.colors.error, borderColor: theme.colors.border }]}
          onPress={handleLeaveMatch}
        >
          <MaterialIcons name="exit-to-app" size={20} color={theme.colors.buttonText} />
          <Text style={[styles.leaveButtonText, { color: theme.colors.buttonText }]}>
            {uiStrings[systemLang].leaveMatch || 'Leave Match'}
          </Text>
        </Pressable>
      </View>
      <Toast />
    </View>
  );
};

// Helper function to get color for player avatars
const getPlayerColor = (index, theme) => {
  const colors = [theme.colors.blue, theme.colors.red, theme.colors.yellow, theme.colors.green];
  return colors[index % colors.length];
};

export default WaitingRoom;
