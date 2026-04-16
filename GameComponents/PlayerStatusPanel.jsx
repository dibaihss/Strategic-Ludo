import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import StatusBadge from '../assets/shared/StatusBadge.jsx';
import { getLocalizedColor } from '../assets/shared/hardCodedData.js';

const PlayerStatusPanel = ({ containerStyle }) => {
  const theme = useSelector(state => state.theme.current);
  const playerColors = useSelector(state => state.game?.playerColors);
  const playerConnectionStatus = useSelector(state => state.game?.playerConnectionStatus || {});
  const systemLang = useSelector(state => state.language.systemLang);

  const playerOrder = ['blue', 'red', 'yellow', 'green'];

  const activePlayers = playerOrder.filter(color => playerColors && playerColors[color]);

  if (activePlayers.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {activePlayers.map((color, index) => {
        const ownerId = playerColors[color];
        const status = playerConnectionStatus[ownerId] || 'connected';
        const playerName = getLocalizedColor(color, systemLang);

        return (
          <View key={color} style={styles.playerRow}>
            <View style={[styles.colorIndicator, { backgroundColor: theme.colors[color] }]} />
            <Text style={[styles.playerName, { color: theme.colors.text }]} numberOfLines={1}>
              {playerName}
            </Text>
            <StatusBadge status={status} size="sm" showPulse={false} />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 10,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  playerName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default PlayerStatusPanel;
