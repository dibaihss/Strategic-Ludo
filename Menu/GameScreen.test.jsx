import React from 'react';
import { render } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as RN from 'react-native';

RN.Modal = ({ children }) => children;
import { useWebSocket } from '../assets/shared/webSocketConnection.jsx';
import GameScreen from './GameScreen';
import { setCurrentPlayerColor } from '../assets/store/gameSlice.jsx';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('../GameComponents/SmalBoard.jsx', () => () => null);
jest.mock('../GameComponents/Goals.jsx', () => () => null);
jest.mock('../GameComponents/Bases.jsx', () => () => null);
jest.mock('../GameComponents/Timer.jsx', () => () => null);
jest.mock('./Instructions.jsx', () => () => null);

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../assets/shared/webSocketConnection.jsx', () => ({
  useWebSocket: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn(() => Promise.resolve()),
  deactivateKeepAwake: jest.fn(() => Promise.resolve()),
}));

jest.mock('../assets/store/authSlice.jsx', () => ({
  setCurrentUserPage: jest.fn(() => ({ type: 'auth/setCurrentUserPage' })),
}));

jest.mock('../assets/store/sessionApiShared.jsx', () => ({
  isE2EMode: false,
  API_URL: 'http://localhost',
  getE2EMatches: jest.fn(),
  setE2EMatches: jest.fn(),
  createE2EUser: jest.fn(),
  getAuthToken: jest.fn(),
  requireAuthToken: jest.fn(),
}));

const createState = (overrides = {}) => {
  const baseState = {
    game: {
      playerColors: { blue: 'user-1' },
      activePlayer: 'blue',
      currentPlayerColor: 'blue',
      isOnline: false,
      blueSoldiers: [
        { id: 1, color: 'blue', isOut: true },
        { id: 2, color: 'blue', isOut: true },
        { id: 3, color: 'blue', isOut: true },
        { id: 4, color: 'blue', isOut: true },
      ],
      redSoldiers: [
        { id: 5, color: 'red', isOut: true },
        { id: 6, color: 'red', isOut: true },
        { id: 7, color: 'red', isOut: false },
        { id: 8, color: 'red', isOut: false },
      ],
      yellowSoldiers: [
        { id: 9, color: 'yellow', isOut: true },
        { id: 10, color: 'yellow', isOut: false },
        { id: 11, color: 'yellow', isOut: false },
        { id: 12, color: 'yellow', isOut: false },
      ],
      greenSoldiers: [
        { id: 13, color: 'green', isOut: false },
        { id: 14, color: 'green', isOut: false },
        { id: 15, color: 'green', isOut: false },
        { id: 16, color: 'green', isOut: false },
      ],
    },
    theme: {
      current: {
        colors: {
          button: '#fff',
          buttonBorder: '#111',
          buttonText: '#111',
          red: '#f00',
          yellow: '#ff0',
          blue: '#00f',
          green: '#0f0',
          border: '#333',
          background: '#fff',
          text: '#000',
          textSecondary: '#666',
          card: '#f4f4f4',
        },
      },
    },
    language: { systemLang: 'en' },
    auth: { user: { id: 'user-1' } },
    session: { currentMatch: { id: 'match-1', users: [{ id: 'user-1' }] } },
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
    auth: {
      ...baseState.auth,
      ...(overrides.auth || {}),
    },
    session: {
      ...baseState.session,
      ...(overrides.session || {}),
    },
  };
};

const configureSelectors = (state) => {
  useSelector.mockImplementation((selector) => selector(state));
};

describe('GameScreen', () => {
  let dispatchMock;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatchMock = jest.fn();
    useDispatch.mockReturnValue(dispatchMock);
    useWebSocket.mockReturnValue({
      connected: false,
      subscribe: jest.fn(),
      sendMessage: jest.fn(),
      sendMatchCommand: jest.fn(),
    });
  });

  test('shows winner popup when a player has all soldiers finished', async () => {
    configureSelectors(createState());

    const { findByText } = render(
      <GameScreen route={{ params: { mode: 'local', matchId: 1 } }} navigation={{ navigate: jest.fn() }} />
    );

    expect(await findByText(/won the Game/i)).toBeTruthy();
    expect(await findByText(/Top rankings/i)).toBeTruthy();
    expect(await findByText(/blue\s*•\s*4\s*completed/i)).toBeTruthy();
  });

  test('does not show winner popup when no player has all soldiers finished', async () => {
    const state = createState({
      game: {
        blueSoldiers: [
          { id: 1, color: 'blue', isOut: true },
          { id: 2, color: 'blue', isOut: true },
          { id: 3, color: 'blue', isOut: false },
          { id: 4, color: 'blue', isOut: true },
        ],
      },
    });
    configureSelectors(state);

    const { queryByText } = render(
      <GameScreen route={{ params: { mode: 'local', matchId: 1 } }} navigation={{ navigate: jest.fn() }} />
    );

    expect(queryByText(/won the Game/i)).toBeNull();
  });

  test('initializes bot mode with blue human control', async () => {
    configureSelectors(createState());

    render(<GameScreen route={{ params: { mode: 'bot', matchId: 1 } }} navigation={{ navigate: jest.fn() }} />);

    expect(dispatchMock).toHaveBeenCalledWith(setCurrentPlayerColor('blue'));
  });

  test('restores multiplayer player colors passed from the waiting room', async () => {
    configureSelectors(createState({
      game: {
        playerColors: { blue: 1, red: 1, yellow: 1, green: 1 },
      },
      auth: { user: { id: 'user-1' } },
    }));

    const multiplayerPlayerColors = {
      blue: 'user-1',
      red: 'bot-1',
      yellow: 'bot-2',
      green: 'user-1',
    };

    render(
      <GameScreen
        route={{ params: { mode: 'multiplayer', matchId: 1, playerColors: multiplayerPlayerColors } }}
        navigation={{ navigate: jest.fn() }}
      />
    );

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'game/setPlayerColors',
      payload: multiplayerPlayerColors,
    });
  });
});
