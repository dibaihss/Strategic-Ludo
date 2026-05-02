import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as RN from 'react-native';

RN.Modal = ({ children }) => children;
import { useWebSocket } from '../assets/shared/webSocketConnection.jsx';
import { cancelPendingBotTurn, emitMultiplayerBotTurn, runBotTurn } from './botLogic.js';
import GameScreen from './GameScreen';
import { setCurrentPlayer, setCurrentPlayerColor } from '../assets/store/gameSlice.jsx';
import { startTutorial } from '../assets/store/tutorialSlice.jsx';
import AsyncStorage from '@react-native-async-storage/async-storage';

let mockIsE2EMode = false;

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('../GameComponents/SmalBoard.jsx', () => () => null);
jest.mock('../GameComponents/Goals.jsx', () => () => null);
jest.mock('../GameComponents/Bases.jsx', () => () => null);
jest.mock('../GameComponents/Timer.jsx', () => () => null);
jest.mock('../GameComponents/TutorialGuide.jsx', () => () => null);
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
    cancelPendingBotTurn: jest.fn(),
    emitMultiplayerBotTurn: jest.fn(() => ({ type: 'movePlayer' })),
    runBotTurn: jest.fn(() => ({ type: 'movePlayer' })),
  };
});

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

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
  get isE2EMode() {
    return mockIsE2EMode;
  },
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
      gamePaused: false,
      disconnectedPlayer: null,
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
  let requestFullSyncMock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsE2EMode = false;
    dispatchMock = jest.fn();
    sendMessageMock = jest.fn();
    sendMatchCommandMock = jest.fn();
    requestFullSyncMock = jest.fn();
    useDispatch.mockReturnValue(dispatchMock);
    useWebSocket.mockReturnValue({
      connected: false,
      subscribe: jest.fn(),
      sendMessage: sendMessageMock,
      sendMatchCommand: sendMatchCommandMock,
      requestFullSync: requestFullSyncMock,
    });
    AsyncStorage.getItem.mockResolvedValue(null);
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

  test('does not render the sync button for multiplayer matches', () => {
    const state = createState({
      game: {
        isOnline: true,
      },
      session: {
        currentMatch: {
          id: 'match-1',
          users: [{ id: 'user-1', name: 'Host' }],
        },
      },
    });

    configureSelectors(state);
    useWebSocket.mockReturnValue({
      connected: true,
      subscribe: jest.fn(),
      sendMessage: sendMessageMock,
      sendMatchCommand: sendMatchCommandMock,
      requestFullSync: requestFullSyncMock,
    });

    const { queryByTestId } = render(
      <GameScreen route={{ params: { mode: 'multiplayer', matchId: 'match-1' } }} navigation={{ navigate: jest.fn() }} />
    );

    expect(queryByTestId('game-sync-state-button')).toBeNull();
  });

  test('does not render the sync button outside multiplayer mode', () => {
    configureSelectors(createState());

    const { queryByTestId } = render(
      <GameScreen route={{ params: { mode: 'local', matchId: 1 } }} navigation={{ navigate: jest.fn() }} />
    );

    expect(queryByTestId('game-sync-state-button')).toBeNull();
  });

  test('does not render the sync button when the multiplayer socket is disconnected', () => {
    const state = createState({
      game: {
        isOnline: true,
      },
      session: {
        currentMatch: {
          id: 'match-1',
          users: [{ id: 'user-1', name: 'Host' }],
        },
      },
    });

    configureSelectors(state);

    const { queryByTestId } = render(
      <GameScreen route={{ params: { mode: 'multiplayer', matchId: 'match-1' } }} navigation={{ navigate: jest.fn() }} />
    );

    expect(queryByTestId('game-sync-state-button')).toBeNull();
  });

  test('starts tutorial automatically in bot mode', async () => {
    configureSelectors(createState({
      tutorial: {
        active: false,
        currentStep: 0,
        completedOnce: false,
        reopenRequested: false,
      },
    }));

    render(<GameScreen route={{ params: { mode: 'bot', matchId: 1 } }} navigation={{ navigate: jest.fn() }} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(dispatchMock).toHaveBeenCalledWith(startTutorial());
  });

  test('forceTutorial route param starts tutorial even when completion is already true', async () => {
    AsyncStorage.getItem.mockResolvedValue('true');

    configureSelectors(createState({
      tutorial: {
        active: false,
        currentStep: 0,
        completedOnce: true,
        reopenRequested: false,
      },
    }));

    render(
      <GameScreen
        route={{ params: { mode: 'bot', matchId: 1, botDifficulty: 'normal', forceTutorial: true } }}
        navigation={{ navigate: jest.fn() }}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(dispatchMock).toHaveBeenCalledWith(startTutorial());
  });

  test('forceTutorial route param is consumed so tutorial does not restart on rerender', async () => {
    configureSelectors(createState({
      tutorial: {
        active: false,
        currentStep: 0,
        completedOnce: false,
        reopenRequested: false,
      },
    }));

    const { rerender } = render(
      <GameScreen
        route={{ params: { mode: 'bot', matchId: 1, botDifficulty: 'normal', forceTutorial: true } }}
        navigation={{ navigate: jest.fn() }}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    const tutorialDispatchCountAfterFirstRender = dispatchMock.mock.calls.filter(
      ([action]) => action?.type === startTutorial().type
    ).length;

    rerender(
      <GameScreen
        route={{ params: { mode: 'bot', matchId: 1, botDifficulty: 'normal', forceTutorial: true } }}
        navigation={{ navigate: jest.fn() }}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    const tutorialDispatchCountAfterRerender = dispatchMock.mock.calls.filter(
      ([action]) => action?.type === startTutorial().type
    ).length;

    expect(tutorialDispatchCountAfterFirstRender).toBe(1);
    expect(tutorialDispatchCountAfterRerender).toBe(1);
  });

  test('does not auto-start tutorial in local mode', async () => {
    configureSelectors(createState({
      tutorial: {
        active: false,
        currentStep: 0,
        completedOnce: false,
        reopenRequested: false,
      },
    }));

    render(<GameScreen route={{ params: { mode: 'local', matchId: 1 } }} navigation={{ navigate: jest.fn() }} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(dispatchMock).not.toHaveBeenCalledWith(startTutorial());
  });

  test('does not render tutorial button on game screen', () => {
    configureSelectors(createState({
      tutorial: {
        active: false,
        currentStep: 0,
        completedOnce: false,
        reopenRequested: false,
      },
    }));

    const { queryByTestId } = render(
      <GameScreen route={{ params: { mode: 'bot', matchId: 'match-1' } }} navigation={{ navigate: jest.fn() }} />
    );

    expect(queryByTestId('game-tutorial-button')).toBeNull();
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
      requestFullSync: requestFullSyncMock,
    });

    const { findByTestId } = render(
      <GameScreen
        route={{ params: { mode: 'multiplayer', matchId: 'match-1', playerColors: state.game.playerColors } }}
        navigation={{ navigate: jest.fn() }}
      />
    );

    expect(await findByTestId('game-screen')).toBeTruthy();

    await act(async () => {
      await Promise.resolve();
    });

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
      requestFullSync: requestFullSyncMock,
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

  test('mocked e2e multiplayer runs bot turns locally when the socket is unavailable', async () => {
    jest.useFakeTimers();
    mockIsE2EMode = true;

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
      connected: false,
      subscribe: jest.fn(),
      sendMessage: sendMessageMock,
      sendMatchCommand: sendMatchCommandMock,
      requestFullSync: requestFullSyncMock,
    });

    const { findByTestId } = render(
      <GameScreen
        route={{ params: { mode: 'multiplayer', matchId: 'match-1', playerColors: state.game.playerColors } }}
        navigation={{ navigate: jest.fn() }}
      />
    );

    expect(await findByTestId('game-screen')).toBeTruthy();

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(runBotTurn).toHaveBeenCalledWith(expect.objectContaining({
      color: 'red',
      difficulty: 'hard',
      activePlayer: 'red',
      cardsByColor: expect.objectContaining({
        red: state.game.redCards,
      }),
      soldiersByColor: expect.objectContaining({
        red: state.game.redSoldiers,
      }),
      shouldCancel: expect.any(Function),
    }));
    expect(emitMultiplayerBotTurn).not.toHaveBeenCalled();
  });

  test('offline bot turns are not rescheduled after execution starts for the same active player', async () => {
    jest.useFakeTimers();

    const initialState = createState({
      game: {
        activePlayer: 'red',
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
    });

    configureSelectors(initialState);

    const { findByTestId, rerender } = render(
      <GameScreen route={{ params: { mode: 'bot', matchId: 1 } }} navigation={{ navigate: jest.fn() }} />
    );

    expect(await findByTestId('game-screen')).toBeTruthy();

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(runBotTurn).toHaveBeenCalledTimes(1);

    const updatedState = createState({
      game: {
        activePlayer: 'red',
        blueSoldiers: [
          { id: 1, color: 'blue', isOut: true },
          { id: 2, color: 'blue', isOut: true },
          { id: 3, color: 'blue', isOut: true },
          { id: 4, color: 'blue', isOut: false },
        ],
        redSoldiers: [
          { id: 5, color: 'red', position: '3b', onBoard: true, isOut: false },
        ],
        redCards: [
          { id: 7, value: 2, used: true },
        ],
      },
    });

    configureSelectors(updatedState);
    rerender(
      <GameScreen route={{ params: { mode: 'bot', matchId: 1 } }} navigation={{ navigate: jest.fn() }} />
    );

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(runBotTurn).toHaveBeenCalledTimes(1);
  });

  test('mocked e2e multiplayer skip turn advances locally without a socket', async () => {
    mockIsE2EMode = true;

    const state = createState({
      game: {
        playerColors: {
          blue: 'user-1',
          red: 'bot-1',
          yellow: 'bot-1',
          green: 'user-1',
        },
        activePlayer: 'blue',
        currentPlayerColor: ['blue', 'green'],
        isOnline: true,
      },
      auth: { user: { id: 'user-1' } },
      session: {
        currentMatch: {
          id: 'match-1',
          users: [
            { id: 'user-1', name: 'Host' },
            { id: 'bot-1', name: 'Bot 1', isBot: true, botDifficulty: 'hard' },
          ],
        },
      },
    });

    configureSelectors(state);
    useWebSocket.mockReturnValue({
      connected: false,
      subscribe: jest.fn(),
      sendMessage: sendMessageMock,
      sendMatchCommand: sendMatchCommandMock,
      requestFullSync: requestFullSyncMock,
    });

    const { findByTestId } = render(
      <GameScreen
        route={{ params: { mode: 'multiplayer', matchId: 'match-1', playerColors: state.game.playerColors } }}
        navigation={{ navigate: jest.fn() }}
      />
    );

    fireEvent.press(await findByTestId('game-skip-turn-button'));

    expect(dispatchMock).toHaveBeenCalledWith({ type: 'game/setActivePlayer' });
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'game/resetTimer' });
  });

  test('gamePaused blocks offline bot turns from being scheduled', async () => {
    jest.useFakeTimers();

    const state = createState({
      game: {
        activePlayer: 'red',
        gamePaused: true,
        redSoldiers: [
          { id: 5, color: 'red', position: '1b', onBoard: true, isOut: false },
        ],
        redCards: [
          { id: 7, value: 2, used: false },
        ],
      },
    });

    configureSelectors(state);

    const { findByTestId } = render(
      <GameScreen route={{ params: { mode: 'bot', matchId: 1 } }} navigation={{ navigate: jest.fn() }} />
    );

    expect(await findByTestId('game-screen')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(runBotTurn).not.toHaveBeenCalled();
    expect(emitMultiplayerBotTurn).not.toHaveBeenCalled();
  });

  test('unmount cancels any pending bot turn before it runs', async () => {
    jest.useFakeTimers();

    const state = createState({
      game: {
        activePlayer: 'red',
        redSoldiers: [
          { id: 5, color: 'red', position: '1b', onBoard: true, isOut: false },
        ],
        redCards: [
          { id: 7, value: 2, used: false },
        ],
      },
    });

    configureSelectors(state);

    const { findByTestId, unmount } = render(
      <GameScreen route={{ params: { mode: 'bot', matchId: 1 } }} navigation={{ navigate: jest.fn() }} />
    );

    expect(await findByTestId('game-screen')).toBeTruthy();

    unmount();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(runBotTurn).not.toHaveBeenCalled();
    expect(cancelPendingBotTurn).toHaveBeenCalled();
  });
});
