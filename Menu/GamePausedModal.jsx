import React, {useEffect} from 'react';
import { Modal, View, Text, StyleSheet, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { uiStrings } from '../assets/shared/hardCodedData.js';
import {setPausedGame, saveGameState, loadGameState, setTimerRunning} from '../assets/store/gameSlice.jsx';
/**
 * Modal component that displays when the game is paused and shows a list of inactive players
 * @returns {JSX.Element} The GamePausedModal component
 */
const GamePausedModal = () => {
  const dispatch = useDispatch();
  const systemLang = useSelector(state => state.language.systemLang);
  const theme = useSelector(state => state.theme.current);
  const gamePaused = useSelector(state => state.game.gamePaused);
//   const unActivePlayers = useSelector(state => state.game.unActivePlayers);
  const currentMatch = useSelector(state => state.auth.currentMatch);

  const inactivePlayers = currentMatch?.users?.filter(user => user.status === false) || [];

  // Check for inactive players and update gamePaused status
  useEffect(() => {
    if (currentMatch?.users?.length > 0) {
      // If any user has status === false, pause the game
      const hasInactivePlayers = currentMatch.users.some(user => user.status === false);
      console.log("Inactive players: ", hasInactivePlayers, "Game paused: ", gamePaused);
      // Only dispatch if there's a change needed to prevent loops
      if (hasInactivePlayers !== gamePaused) {
        dispatch(setPausedGame(hasInactivePlayers));
        // dispatch(saveGameState())
      }else{
        // If all players are active, resume the game
        // dispatch(loadGameState())
      }
      gamePaused ? dispatch(setTimerRunning(false))  : dispatch(setTimerRunning(true))
    }
  }, [currentMatch, dispatch, gamePaused]);


  if (!gamePaused) return null;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={gamePaused}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: '80%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center'
  },
  listContainer: {
    width: '100%',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    maxHeight: 200,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  playerName: {
    fontSize: 16,
    marginLeft: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 16,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
  }
});

export default GamePausedModal;