import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { getLocalizedColor } from '../assets/shared/hardCodedData.js';
import StatusBadge from '../assets/shared/StatusBadge.jsx';

const GamePausedOverlay = ({ visible }) => {
  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const waitingForPlayer = useSelector(state => state.game?.waitingForPlayer);
  const playerColors = useSelector(state => state.game?.playerColors);

  if (!visible || !waitingForPlayer || !waitingForPlayer.userId) {
    return null;
  }

  const waitingPlayerColor = Object.entries(playerColors).find(
    ([_, userId]) => String(userId) === String(waitingForPlayer.userId)
  )?.[0];

  const playerName = waitingPlayerColor 
    ? getLocalizedColor(waitingPlayerColor, systemLang)
    : waitingForPlayer.playerName || 'Player';

  return (
    <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.85)' }]}>
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.iconContainer}>
          <StatusBadge status="disconnected" size="lg" showPulse={false} />
        </View>
        
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {uiStrings[systemLang]?.waitingForPlayer || 'Waiting for Player'}
        </Text>
        
        <Text style={[styles.playerName, { color: theme.colors.warning || '#F59E0B' }]}>
          {playerName}
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {uiStrings[systemLang]?.playerDisconnected || 'Player has disconnected'}
        </Text>
        
        <Text style={[styles.timeoutText, { color: theme.colors.textSecondary }]}>
          {uiStrings[systemLang]?.autoResumeTimeout || 'Game will auto-resume when reconnected'}
        </Text>
      </View>
    </View>
  );
};

const uiStrings = {
  en: {
    waitingForPlayer: 'Waiting for Player',
    playerDisconnected: 'Player has disconnected',
    autoResumeTimeout: 'Game will auto-resume when reconnected',
  },
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  card: {
    width: '85%',
    maxWidth: 320,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  playerName: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  timeoutText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default GamePausedOverlay;
