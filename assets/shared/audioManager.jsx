import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { store } from '../store/store';

const players = {};

const soundConfig = {
  move:       { looping: false, isBackgroundMusic: false },
  capture:    { looping: false, isBackgroundMusic: false },
  win:        { looping: false, isBackgroundMusic: false },
  click:      { looping: false, isBackgroundMusic: false },
};

const getAudioState = () => {
  try {
    const state = store.getState();
    return {
      isMuted:     state.audio?.isMuted      ?? false,
      musicVolume: state.audio?.musicVolume  ?? 1,
      sfxVolume:   state.audio?.sfxVolume    ?? 1,
    };
  } catch {
    return { isMuted: false, musicVolume: 1, sfxVolume: 1 };
  }
};

const applyVolume = async (name) => {
  const player = players[name];
  if (!player) return;

  const { isMuted, musicVolume, sfxVolume } = getAudioState();
  const isBg   = soundConfig[name]?.isBackgroundMusic;
  const volume = isMuted ? 0 : (isBg ? musicVolume : sfxVolume);

  await player.setVolumeAsync(volume);
};

export const initAudio = async () => {
  try {
    if (Platform.OS !== 'web') {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS:         false,
        staysActiveInBackground:    true,
        playsInSilentModeIOS:       true,
        shouldDuckAndroid:          true,
        playThroughEarpieceAndroid: false,
      });
    }

    const audioManifest =
      require('../audio/audioManifest').default ||
      require('../audio/audioManifest');

    const names = Object.keys(soundConfig);
    for (const name of names) {
      const manifest = audioManifest[name];

      if (!manifest) {
        console.warn(`[audioManager] No audio file registered for "${name}"`);
        continue;
      }

      // ✅ Correct API for expo-av < v15
      const { sound } = await Audio.Sound.createAsync(
        manifest,
        {
          shouldPlay:  false,
          isLooping:   soundConfig[name]?.looping ?? false,
          volume:      1,
        }
      );

      players[name] = sound;
      await applyVolume(name);
    }
  } catch (e) {
    console.error('[audioManager] Audio init failed:', e);
  }
};

export const playSound = async (name) => {
  const player = players[name];
  if (!player) return;

  await player.setPositionAsync(0);
  await applyVolume(name);
  await player.playAsync();
};

export const stopSound = async (name) => {
  const player = players[name];
  if (!player) return;

  await player.stopAsync();
  await player.setPositionAsync(0);
};

export const pauseSound = async (name) => {
  const player = players[name];
  if (!player) return;

  await player.pauseAsync();
};

export const resumeSound = async (name) => {
  const player = players[name];
  if (!player) return;

  await applyVolume(name);
  await player.playAsync();
};

export const stopAllSounds = async () => {
  for (const name of Object.keys(players)) {
    await stopSound(name);
  }
};

export const syncAllVolumes = async () => {
  for (const name of Object.keys(players)) {
    await applyVolume(name);
  }
};

export const cleanupAudio = async () => {
  for (const name of Object.keys(players)) {
    const player = players[name];
    if (player) {
      await player.stopAsync();
      await player.unloadAsync(); // ✅ correct unload method
    }
    delete players[name];
  }
};