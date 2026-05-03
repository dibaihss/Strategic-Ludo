jest.mock('../assets/store/gameSlice.jsx', () => ({
  resetTimer: jest.fn(() => ({ type: 'game/resetTimer' })),
  setActivePlayer: jest.fn(() => ({ type: 'game/setActivePlayer' })),
}));

jest.mock('../assets/store/authSlice.jsx', () => ({
  logout: jest.fn(() => Promise.resolve()),
  clearAuth: jest.fn(() => ({ type: 'auth/clearAuth' })),
}));

import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as RN from 'react-native';
import HomeScreen from './HomeScreen';
import { act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

RN.Modal = ({ visible, children }) => (visible ? children : null);

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));

const createState = (overrides = {}) => ({
  theme: {
    current: {
      colors: {
        accent: '#2c7',
        text: '#111',
        textSecondary: '#666',
        background: '#fff',
        card: '#f4f4f4',
        border: '#ddd',
        buttonText: '#fff',
        success: '#0a0',
        error: '#c00',
      },
    },
  },
  language: { systemLang: 'en' },
  auth: {
    isLoggedIn: true,
    user: { id: 'user-1', name: 'Player' },
  },
  ...overrides,
});

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('shows offline options when pressing play offline', () => {
    const navigation = { navigate: jest.fn() };
    const state = createState();

    useSelector.mockImplementation((selector) => selector(state));

    const { getByTestId, queryByTestId } = render(<HomeScreen navigation={navigation} />);

    // Initially, offline options should not be visible
    expect(queryByTestId('offline-choice-local-button')).toBeNull();

    // Press play offline button
    fireEvent.press(getByTestId('home-play-offline-button'));

    // Now offline options should be visible
    expect(getByTestId('offline-choice-local-button')).toBeTruthy();
    expect(getByTestId('offline-choice-bot-button')).toBeTruthy();
  });

  test('renders play tutorial button', () => {
    const navigation = { navigate: jest.fn() };
    const state = createState();

    useSelector.mockImplementation((selector) => selector(state));

    const { getByTestId } = render(<HomeScreen navigation={navigation} />);

    expect(getByTestId('home-play-tutorial-button')).toBeTruthy();
  });

  test('play tutorial button sets bot-normal redirect keys', async () => {
    const navigation = { navigate: jest.fn() };
    const state = createState({ auth: { isLoggedIn: true, user: { id: 'user-1', name: 'Player' } } });

    useSelector.mockImplementation((selector) => selector(state));

    const reloadMock = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: reloadMock },
    });

    const { getByTestId } = render(<HomeScreen navigation={navigation} />);

    await act(async () => {
      fireEvent.press(getByTestId('home-play-tutorial-button'));
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('REDIRECT_TO_GAME', 'true');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('REDIRECT_GAME_MODE', 'bot');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('REDIRECT_BOT_DIFFICULTY', 'normal');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('REDIRECT_FORCE_TUTORIAL', 'true');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('REDIRECT_ISLOGGED_IN', 'true');
    });

    expect(reloadMock).toHaveBeenCalled();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  test('offline local mode navigates directly to Game when window reload is unavailable', async () => {
    const navigation = { navigate: jest.fn() };
    const state = createState();

    useSelector.mockImplementation((selector) => selector(state));

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {},
    });

    const { getByTestId } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByTestId('home-play-offline-button'));

    await act(async () => {
      fireEvent.press(getByTestId('offline-choice-local-button'));
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('REDIRECT_TO_GAME', 'true');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('REDIRECT_GAME_MODE', 'local');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('REDIRECT_ISLOGGED_IN', 'true');
    });

    expect(navigation.navigate).toHaveBeenCalledWith('Game', { mode: 'local' });
  });
});
