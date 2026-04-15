import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as RN from 'react-native';

RN.Modal = ({ children }) => children;
import { useWebSocket } from '../assets/shared/webSocketConnection.jsx';
import { emitMultiplayerBotTurn, runBotTurn } from './botLogic.js';
import GameScreen from './GameScreen';
import { setCurrentPlayer, setCurrentPlayerColor } from '../assets/store/gameSlice.jsx';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn((effect) => effect()),
}));

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

jest.mock('./botLogic.js', () => {
  const actual = jest.requireActual('./botLogic.js');
  return {
    ...actual,
    emitMultiplayerBotTurn: jest.fn(() => ({ type: 'movePlayer' })),
    runBotTurn: jest.fn(() => ({ type: 'movePlayer' })),
  };
});

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useFocusEffect: jest.fn((effect) => effect()),
  };
});

jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn(() => Promise.resolve()),
  deactivateKeepAwake: jest.fn(() => Promise.resolve()),
}));

jest.mock('../assets/store/authSlice.jsx', () => {
  const actual = jest.requireActual('../assets/store/authSlice.jsx');
  return {
    ...actual,
    setCurrentUserPage: jest.fn(() => ({ type: 'auth/setCurrentUserPage' })),
  };
});

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
  let sendMessageMock;
  let sendMatchCommandMock;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatchMock = jest.fn();
    sendMessageMock = jest.fn();
    sendMatchCommandMock = jest.fn();
    useDispatch.mockReturnValue(dispatchMock);
    useWebSocket.mockReturnValue({
      connected: false,
      subscribe: jest.fn(),
      sendMessage: sendMessageMock,
      sendMatchCommand: sendMatchCommandMock,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('shows winner popup when a player has all soldiers finished', async () => {
    configureSelectors(createState());

    const { getByText } = render(
      <GameScreen route={{ params: { mode: 'local', matchId: 1 } }} navigation={{ navigate: jest.fn() }} />
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(getByText(/won the Game/i)).toBeTruthy();
    expect(getByText(/Top rankings/i)).toBeTruthy();
    expect(getByText(/4\s*completed/i)).toBeTruthy();
  });

  test('does not show winner popup when no player has all soldiers finished', () => {
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

  test('initializes bot mode with blue human control', () => {
    configureSelectors(createState());

    render(<GameScreen route={{ params: { mode: 'bot', matchId: 1 } }} navigation={{ navigate: jest.fn() }} />);

    expect(dispatchMock).toHaveBeenCalledWith(setCurrentPlayerColor('blue'));
  });

  test('restores multiplayer player colors passed from the waiting room', () => {
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

  test('host emits multiplayer bot moves through the websocket flow instead of local bot execution', async () => {
    jest.useFakeTimers();

    const state = createState({
      game: {
        playerColors: {
          blue: 'user-1',
          red: 'bot-1',
          yellow: 'user-2',
          green: 'user-1',
        },
        activePlayer: 'red',
        currentPlayerColor: ['blue', 'green'],
        isOnline: true,
        blueSoldiers: [
          { id: 1, color: 'blue', isOut: true },
          { id: 2, color: 'blue', isOut: true },
          { id: 3, color: 'blue', isOut: true },
          { id: 4, color: 'blue', isOut: false },
        ],
        redSoldiers: [
          { id: 5, color: 'red', position: '1b', onBoard: true, isOut: false },
          { id: 6, color: 'red', position: '2red', onBoard: false, isOut: false },
          { id: 7, color: 'red', position: '3red', onBoard: false, isOut: false },
          { id: 8, color: 'red', position: '4red', onBoard: false, isOut: false },
        ],
        redCards: [
          { id: 7, value: 2, used: false },
        ],
      },
      auth: { user: { id: 'user-1' } },
      session: {
        currentMatch: {
          id: 'match-1',
          users: [
            { id: 'user-1', name: 'Host' },
            { id: 'bot-1', name: 'Bot 1', isBot: true, botDifficulty: 'hard' },
            { id: 'user-2', name: 'Guest' },
          ],
        },
      },
    });

    configureSelectors(state);
    useWebSocket.mockReturnValue({
      connected: true,
      subscribe: jest.fn(),
      sendMessage: sendMessageMock,
      sendMatchCommand: sendMatchCommandMock,
    });

    const { findByTestId } = render(
      <GameScreen
        route={{ params: { mode: 'multiplayer', matchId: 'match-1', playerColors: state.game.playerColors } }}
        navigation={{ navigate: jest.fn() }}
      />
    );

    expect(await findByTestId('game-screen')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(emitMultiplayerBotTurn).toHaveBeenCalledWith(expect.objectContaining({
      color: 'red',
      difficulty: 'hard',
      connected: true,
      currentMatch: state.session.currentMatch,
      user: { id: 'user-1' },
      sendMessage: sendMessageMock,
      sendMatchCommand: sendMatchCommandMock,
    }));
    expect(runBotTurn).not.toHaveBeenCalled();
    expect(dispatchMock).not.toHaveBeenCalledWith(setCurrentPlayer({
      id: 5,
      color: 'red',
      position: '1b',
      onBoard: true,
      isOut: false,
    }));
  });

  test('non-host clients do not emit multiplayer bot moves', async () => {
    jest.useFakeTimers();

    const state = createState({
      game: {
        playerColors: {
          blue: 'user-1',
          red: 'bot-1',
          yellow: 'user-2',
          green: 'user-1',
        },
        activePlayer: 'red',
        currentPlayerColor: 'yellow',
        isOnline: true,
        blueSoldiers: [
          { id: 1, color: 'blue', isOut: true },
          { id: 2, color: 'blue', isOut: true },
          { id: 3, color: 'blue', isOut: true },
          { id: 4, color: 'blue', isOut: false },
        ],
        redSoldiers: [
          { id: 5, color: 'red', position: '1b', onBoard: true, isOut: false },
        ],
        redCards: [
          { id: 7, value: 2, used: false },
        ],
      },
      auth: { user: { id: 'user-2' } },
      session: {
        currentMatch: {
          id: 'match-1',
          users: [
            { id: 'user-1', name: 'Host' },
            { id: 'user-2', name: 'Guest' },
            { id: 'bot-1', name: 'Bot 1', isBot: true, botDifficulty: 'hard' },
          ],
        },
      },
    });

    configureSelectors(state);
    useWebSocket.mockReturnValue({
      connected: true,
      subscribe: jest.fn(),
      sendMessage: sendMessageMock,
      sendMatchCommand: sendMatchCommandMock,
    });

    const { findByTestId } = render(
      <GameScreen
        route={{ params: { mode: 'multiplayer', matchId: 'match-1', playerColors: state.game.playerColors } }}
        navigation={{ navigate: jest.fn() }}
      />
    );

    expect(await findByTestId('game-screen')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(emitMultiplayerBotTurn).not.toHaveBeenCalled();
    expect(runBotTurn).not.toHaveBeenCalled();
  });

  test('exit confirmation uses goBack when the game screen can go back', async () => {
    configureSelectors(createState());
    const navigation = {
      canGoBack: jest.fn(() => true),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      navigate: jest.fn(),
    };

    const { getAllByText, getByTestId } = render(
      <GameScreen route={{ params: { mode: 'bot', matchId: 1 } }} navigation={navigation} />
    );

    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.press(getByTestId('game-exit-button'));
    const exitButtons = getAllByText('Exit');
    fireEvent.press(exitButtons[exitButtons.length - 1]);

    expect(navigation.goBack).toHaveBeenCalledTimes(1);
    expect(navigation.dispatch).not.toHaveBeenCalled();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  test('exit confirmation resets to home when no back route exists', async () => {
    configureSelectors(createState());
    dispatchMock.mockReturnValue({
      unwrap: () => Promise.resolve(),
    });
    const navigation = {
      canGoBack: jest.fn(() => false),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      navigate: jest.fn(),
    };

    const { getAllByText, getByTestId } = render(
      <GameScreen route={{ params: { mode: 'multiplayer', matchId: 1 } }} navigation={navigation} />
    );

    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.press(getByTestId('game-exit-button'));
    const exitButtons = getAllByText('Exit');
    fireEvent.press(exitButtons[exitButtons.length - 1]);

    expect(navigation.goBack).not.toHaveBeenCalled();
    expect(navigation.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'RESET',
        payload: {
          index: 0,
          routes: [{ name: 'Home' }],
        },
      })
    );
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});
