import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentMatch, updateMatch, updateMatchStatus, leaveMatch } from '../assets/store/sessionSlice.jsx';
import { setPlayerColors, updateSoldiersPosition, removeColorFromAvailableColors, setActivePlayer } from '../assets/store/gameSlice.jsx';
import { uiStrings } from '../assets/shared/hardCodedData.js';
import { useWebSocket } from '../assets/shared/webSocketConnection.jsx';
import Toast from 'react-native-toast-message';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

const WaitingRoom = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const currentMatch = useSelector(state => state.session.currentMatch);
  const user = useSelector(state => state.auth.user);
  const loading = useSelector(state => state.session.loading);

  const [count, setCount] = useState(3);
  const intervalRef = useRef(null);

  const [refreshing, setRefreshing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const keepAwakeActivatedRef = useRef(false);


  const { connected, subscribe, sendMessage } = useWebSocket();

  const [showCountdown, setShowCountdown] = useState(false)

  let join = route.params?.join || false;

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

  const isUserHost = () => {
    if (!currentMatch || !user) return false;

    // Assuming the first user in the array is the host
    return currentMatch.users?.[0]?.id === user.id;
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
    if(!match || !match.id) return;
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

  const handleStartGame = () => {
    const players = Array.isArray(currentMatch?.users) ? currentMatch.users : [];
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
    dispatch(setPlayerColors(playerColors))
    navigation.navigate('Game', {
      mode: 'multiplayer',
      matchId: currentMatch.id,
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

        <FlatList
          data={currentMatch.users || []}
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

              {index === 0 && (
                <View style={[styles.hostBadge, { backgroundColor: theme.colors.yellow }]}>
                  <Text style={[styles.hostBadgeText, { color: theme.colors.text }]}>
                    {uiStrings[systemLang].host || 'Host'}
                  </Text>
                </View>
              )}
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
              {currentMatch.users?.length === 1
                ? uiStrings[systemLang].needMorePlayers || 'Need at least one more player to start'
                : null}
            </Text>
          </View>
        }

      </View>

      <View style={styles.footer}>
        {(currentMatch?.users?.length >= 2) && (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  playersContainer: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  playersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  refreshIndicator: {
    marginBottom: 16,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
  },
  playerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  playerInitial: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  hostBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  hostBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    padding: 24,
    fontStyle: 'italic',
  },
  joinInfo: {
    marginTop: 20,
    padding: 16,
  },
  joinInfoText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    flex: 0.7,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginLeft: 12,
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leaveButtonText: {
    fontSize: 14,
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  countdownContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    position: 'absolute',
    top: '75%',
    alignSelf: 'center',
    zIndex: 1000,
    width: '85%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  countdownText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default WaitingRoom;
