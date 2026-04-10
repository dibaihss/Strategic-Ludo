jest.mock('../assets/store/gameSlice.jsx', () => ({
  resetTimer: jest.fn(() => ({ type: 'game/resetTimer' })),
  setActivePlayer: jest.fn(() => ({ type: 'game/setActivePlayer' })),
}));

jest.mock('../assets/store/authSlice.jsx', () => ({
  logout: jest.fn(() => Promise.resolve()),
  clearAuth: jest.fn(() => ({ type: 'auth/clearAuth' })),
}));

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as RN from 'react-native';
import HomeScreen from './HomeScreen';

RN.Modal = ({ visible, children }) => (visible ? children : null);

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
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

  test('passes selected offline bot difficulty into game navigation', () => {
    const navigation = { navigate: jest.fn() };
    const state = createState();

    useSelector.mockImplementation((selector) => selector(state));

    const { getByTestId } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByTestId('home-play-offline-button'));
    fireEvent.press(getByTestId('offline-choice-bot-button'));
    fireEvent.press(getByTestId('bot-difficulty-normal-button'));

    expect(navigation.navigate).toHaveBeenCalledWith('Game', {
      mode: 'bot',
      botDifficulty: 'normal',
    });
  });
});
