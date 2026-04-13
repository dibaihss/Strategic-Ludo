jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock(
  'expo-av',
  () => ({
    Audio: {
      Sound: {
        createAsync: jest.fn().mockResolvedValue({
          sound: {
            getStatusAsync: jest.fn(),
            setVolumeAsync: jest.fn(),
            stopAsync: jest.fn(),
            setPositionAsync: jest.fn(),
            playAsync: jest.fn(),
            pauseAsync: jest.fn(),
            unloadAsync: jest.fn(),
          },
        }),
      },
      setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    },
  }),
  { virtual: true }
);
