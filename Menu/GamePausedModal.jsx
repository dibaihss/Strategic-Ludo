import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { uiStrings } from '../assets/shared/hardCodedData.js';
import { setPausedGame, setTimerRunning } from '../assets/store/gameSlice.jsx';
import { leaveMatch } from '../assets/store/dbSlice.jsx';



const GamePausedModal = ({ sendMessage }) => {
  const dispatch = useDispatch();
  const systemLang = useSelector(state => state.language.systemLang);
  const theme = useSelector(state => state.theme.current);
  const gamePaused = useSelector(state => state.game.gamePaused);
  const currentMatch = useSelector(state => state.auth.currentMatch);


  const inactivePlayers = currentMatch?.users?.filter(user => user.status === false) || [];

  // Check for inactive players and update gamePaused status
  useEffect(() => {
    if (currentMatch?.users?.length > 0) {
      const hasInactivePlayers = currentMatch.users.some(user => user.status === false);
      if (hasInactivePlayers !== gamePaused) {
        dispatch(setPausedGame(hasInactivePlayers));
      }
      gamePaused ? dispatch(setTimerRunning(false)) : dispatch(setTimerRunning(true));
    }
  }, [currentMatch, dispatch, gamePaused]);


  // Handle kicking a player
  const handleKickPlayer = (playerId) => {
    console.log(`Kicking player ${playerId}`);
    if (currentMatch && currentMatch.id) {
      console.log(`Kicking player ${playerId} from match ${currentMatch.id}`);
      sendMessage(`/app/waitingRoom.gameStarted/${currentMatch.id}`, { type: 'userKicked', userId: playerId, colors: findUserColors(playerId) });
      dispatch(leaveMatch({ matchId: currentMatch.id, playerId }))
        .unwrap()
        .then(() => {
          console.log(`Player ${playerId} kicked successfully`);
        })
        .catch(error => {
          console.error(`Failed to kick player ${playerId}:`, error);
        });
    }
  };
  const findUserColors = (userId) => {
    if (!user || !user.id || !playerColors) {
      return []; // Return an empty array if user or playerColors aren't available
    }
    const userEntries = Object.entries(playerColors).filter(([color, user_id]) => user_id === userId);
    return userEntries.map(([color]) => color); // Return an array of colors
  };
  if (!gamePaused) return null;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={gamePaused}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: "white" }]}>
          <MaterialIcons name="pause-circle-filled" size={48} color={theme.colors.warning} style={styles.icon} />

          <Text style={[styles.title, { color: theme.colors.text }]}>
            {uiStrings[systemLang]?.gamePaused || 'Game Paused'}
          </Text>

          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {uiStrings[systemLang]?.waitingForPlayers || 'Waiting for players to return...'}
          </Text>

          <View style={[styles.listContainer, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.listTitle, { color: theme.colors.textSecondary }]}>
              {uiStrings[systemLang]?.inactivePlayers || 'Inactive Players'}:
            </Text>

            {inactivePlayers.length > 0 ? (
              <FlatList
                data={inactivePlayers}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={styles.playerItem}>
                    <MaterialIcons name="person-off" size={20} color={theme.colors.error} />
                    <Text style={[styles.playerName, { color: theme.colors.text }]}>
                      {item.name}
                    </Text>
                    <Pressable
                      style={[styles.kickButton, { backgroundColor: theme.colors.error }]}
                      onPress={() => handleKickPlayer(item.id)}
                    >
                      <Text style={styles.kickButtonText}>
                        {uiStrings[systemLang]?.kick || 'Kick'}
                      </Text>
                    </Pressable>
                  </View>
                )}
              />
            ) : (
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {uiStrings[systemLang]?.noInactivePlayers || 'No inactive players found'}
              </Text>
            )}
          </View>

          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {uiStrings[systemLang]?.gameResumeAutomatically || 'The game will resume automatically when all players return.'}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay for better focus
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#2A2E35', // Modern dark background
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#FFFFFF', // White text for better contrast
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#A0A0A0', // Light gray for secondary text
  },
  listContainer: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#3A3F47', // Slightly lighter background for the list
    maxHeight: 250,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#FFFFFF', // White text for the title
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)', // Subtle divider
  },
  playerName: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    color: '#FFFFFF', // White text for player names
  },
  kickButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#E63946', // Red for the kick button
  },
  kickButtonText: {
    color: '#FFFFFF', // White text for the button
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 16,
    color: '#A0A0A0', // Light gray for empty state text
  },
  infoText: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    color: '#A0A0A0', // Light gray for informational text
  },
});

export default GamePausedModal;