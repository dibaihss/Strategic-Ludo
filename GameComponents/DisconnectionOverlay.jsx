import React from 'react';
import { View, Text, StyleSheet, Modal, Dimensions, Pressable } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { getLocalizedColor } from "../assets/shared/hardCodedData.js";
import { useWebSocket } from "../assets/shared/webSocketConnection.jsx";
import { leaveMatch } from "../assets/store/sessionSlice.jsx";
import { setDisconnectedPlayer, setPausedGame } from "../assets/store/gameSlice.jsx";

const DisconnectionOverlay = ({ navigation }) => {
  const dispatch = useDispatch();
  const disconnectedPlayer = useSelector(state => state.game.disconnectedPlayer);
  const gamePaused = useSelector(state => state.game.gamePaused);
  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const user = useSelector(state => state.auth.user);
  const currentMatch = useSelector(state => state.session.currentMatch);
  const currentPlayerColor = useSelector(state => state.game.currentPlayerColor);
  const { sendMessage } = useWebSocket();
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 375;

  const handleExitGame = () => {
    if (currentMatch && currentMatch.id) {
      sendMessage(`/app/waitingRoom.gameStarted/${currentMatch.id}`, { type: 'userLeft', userId: user.id, colors: currentPlayerColor });
      dispatch(leaveMatch({ matchId: currentMatch.id, playerId: user.id }))
        .unwrap()
        .catch(error => {
          console.error('Failed to leave match:', error);
        });
    }
    dispatch(setDisconnectedPlayer(null));
    dispatch(setPausedGame(false));
    navigation.navigate('Home');
  };

  if (!disconnectedPlayer || !gamePaused) {
    return null;
  }


  const playerName = disconnectedPlayer.name || 'Unknown Player';
  const playerColor = disconnectedPlayer.color || 'blue';
  const localizedColor = getLocalizedColor(playerColor, systemLang);

  return (
    <Modal
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[styles.overlay, { zIndex: 10000 }]}>
        <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors[playerColor] || theme.colors.blue }]}>
            <MaterialIcons name="wifi-off" size={40} color="#ffffff" />
          </View>
          
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Player Disconnected
          </Text>
          
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            <Text style={{ fontWeight: 'bold', color: theme.colors[playerColor] || theme.colors.blue }}>
              {playerName}
            </Text>
            {' '}controlling{' '}
            <Text style={{ fontWeight: 'bold', color: theme.colors[playerColor] || theme.colors.blue }}>
              {localizedColor}
            </Text>
            {' '}has disconnected.
          </Text>
          
          <View style={styles.waitingContainer}>
            <MaterialIcons name="hourglass-empty" size={24} color={theme.colors.warning || '#f59e0b'} />
            <Text style={[styles.waitingText, { color: theme.colors.warning || '#f59e0b' }]}>
              Waiting for reconnection...
            </Text>
          </View>
          
          <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
            Game is paused until player reconnects
          </Text>

          <Pressable
            testID="overlay-exit-button"
            style={[styles.exitButton, { backgroundColor: theme.colors.button }]}
            onPress={handleExitGame}
          >
            <MaterialIcons name="exit-to-app" size={20} color={theme.colors.buttonText} />
            <Text style={[styles.exitButtonText, { color: theme.colors.buttonText }]}>
              Exit Game
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  waitingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 16,
  },
  waitingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  hint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
    gap: 8,
  },
  exitButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default DisconnectionOverlay;