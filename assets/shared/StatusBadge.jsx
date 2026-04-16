import React from 'react';
import { View, StyleSheet } from 'react-native';

const STATUS_COLORS = {
  connected: '#22C55E',
  disconnected: '#9CA3AF',
  inactive: '#F59E0B',
};

const STATUS_SIZES = {
  sm: 8,
  md: 12,
  lg: 16,
};

const PULSE_SIZES = {
  sm: 16,
  md: 24,
  lg: 32,
};

const StatusBadge = ({ 
  status = 'connected', 
  size = 'md',
  showPulse = true,
  style 
}) => {
  const badgeColor = STATUS_COLORS[status] || STATUS_COLORS.connected;
  const badgeSize = STATUS_SIZES[size] || STATUS_SIZES.md;
  const pulseSize = PULSE_SIZES[size] || PULSE_SIZES.md;

  return (
    <View style={[styles.container, style]}>
      {showPulse && status === 'connected' && (
        <View
          style={[
            styles.pulse,
            {
              backgroundColor: badgeColor,
              width: pulseSize,
              height: pulseSize,
              borderRadius: pulseSize / 2,
            },
          ]}
        />
      )}
      <View
        style={[
          styles.badge,
          {
            backgroundColor: badgeColor,
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            borderWidth: status === 'inactive' ? 2 : 1.5,
            borderColor: status === 'inactive' ? '#FFF' : 'rgba(255,255,255,0.6)',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  pulse: {
    position: 'absolute',
    opacity: 0.3,
  },
});

export default StatusBadge;
