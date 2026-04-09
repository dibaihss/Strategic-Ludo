import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { useSelector } from 'react-redux';
import Goals from './Goals';
import Toast from 'react-native-toast-message';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

jest.mock('./Soldier', () => () => null);

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

const createState = (overrides = {}) => {
  const baseState = {
    game: {
      blueSoldiers: [],
      redSoldiers: [
        { id: 1, color: 'red', isOut: true },
        { id: 2, color: 'red', isOut: true },
        { id: 3, color: 'red', isOut: true },
        { id: 4, color: 'red', isOut: true },
      ],
      yellowSoldiers: [],
      greenSoldiers: [],
    },
    theme: {
      current: {
        colors: {
          red: '#f00',
          yellow: '#ff0',
          blue: '#00f',
          green: '#0f0',
          background: '#fff',
          border: '#000',
        },
      },
    },
    language: { systemLang: 'en' },
  };

  return {
    ...baseState,
    ...overrides,
    game: {
      ...baseState.game,
      ...(overrides.game || {}),
    },
    theme: {
      ...baseState.theme,
      ...(overrides.theme || {}),
      current: {
        ...baseState.theme.current,
        ...(overrides.theme?.current || {}),
      },
    },
    language: {
      ...baseState.language,
      ...(overrides.language || {}),
    },
  };
};

const configureSelectors = (state) => {
  useSelector.mockImplementation((selector) => selector(state));
};

describe('Goals component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    configureSelectors(createState());
  });

  test('shows a toast when a color completes all soldiers', async () => {
    render(<Goals />);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledTimes(1);
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          text1: expect.stringMatching(/red/i),
        })
      );
    });
  });

  test('does not show a toast when no color has all soldiers completed', async () => {
    const state = createState({
      game: {
        redSoldiers: [
          { id: 1, color: 'red', isOut: true },
          { id: 2, color: 'red', isOut: false },
          { id: 3, color: 'red', isOut: true },
          { id: 4, color: 'red', isOut: true },
        ],
      },
    });
    configureSelectors(state);

    render(<Goals />);

    await waitFor(() => {
      expect(Toast.show).not.toHaveBeenCalled();
    });
  });
});
