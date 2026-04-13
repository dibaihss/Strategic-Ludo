import React from 'react';
import { Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { toggleMute } from '../assets/store/audioSlice';
import { playSound, syncAllVolumes } from '../assets/shared/audioManager';

const SoundToggle = () => {
  const dispatch = useDispatch();
  const isMuted = useSelector(state => state.audio?.isMuted ?? false);

  const handleToggle = async () => {
    dispatch(toggleMute());
    await syncAllVolumes();
    // Play click SFX only if not muted (so sound plays on unmute)
    if (!isMuted) {
      await playSound('click');
    }
  };

  return (
    <Pressable
      onPress={handleToggle}
      style={{
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        marginLeft: 8,
      }}
      hitSlop={8}
    >
      <MaterialIcons
        name={isMuted ? 'volume-off' : 'volume-up'}
        size={22}
        color="#ffffff"
      />
    </Pressable>
  );
};

export default SoundToggle;
