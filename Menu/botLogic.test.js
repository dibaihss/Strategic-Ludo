import {
  buildBotMultiplayerMessages,
  chooseBotAction,
  emitMultiplayerBotTurn,
  getFirstAvailableBotPlayer,
  getBotDifficultyForTurn,
  getPlayerOwner,
  isBotControlledPlayer,
  runBotTurn,
} from './botLogic';
import { getSoldiersForColor } from './botStrategy';
import { resetTimer, setActivePlayer, setCurrentPlayer } from '../assets/store/gameSlice.jsx';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

const createCardsByColor = (overrides = {}) => ({
  blue: [],
  red: [],
  yellow: [],
  green: [],
  ...overrides,
});

const createSoldiersByColor = (overrides = {}) => ({
  blue: [],
  red: [],
  yellow: [],
  green: [],
  ...overrides,
});

describe('botLogic', () => {
  test('getSoldiersForColor returns the soldiers for a given color', () => {
    const soldiersByColor = createSoldiersByColor({
      red: [{ id: 5, color: 'red', onBoard: true, isOut: false }],
    });

    expect(getSoldiersForColor(soldiersByColor, 'red')).toEqual([
      { id: 5, color: 'red', onBoard: true, isOut: false },
    ]);
  });

  test('getPlayerOwner returns the mapped owner for a color', () => {
    const users = [
      { id: 'user-1', name: 'Host' },
      { id: 'bot-1', name: 'Bot 1', isBot: true },
    ];
    const playerColors = { blue: 'user-1', red: 'bot-1' };

    expect(getPlayerOwner(users, playerColors, 'red')).toEqual({
      id: 'bot-1',
      name: 'Bot 1',
      isBot: true,
    });
  });

  test('isBotControlledPlayer detects bot-owned colors in multiplayer matches', () => {
    const users = [
      { id: 'user-1', name: 'Host' },
      { id: 'bot-1', name: 'Bot 1', isBot: true },
    ];
    const playerColors = { blue: 'user-1', red: 'bot-1' };

    expect(isBotControlledPlayer(users, playerColors, 'red')).toBe(true);
    expect(isBotControlledPlayer(users, playerColors, 'blue')).toBe(false);
  });

  test('getBotDifficultyForTurn resolves offline and multiplayer bot difficulty', () => {
    const users = [
      { id: 'user-1', name: 'Host' },
      { id: 'bot-1', name: 'Bot 1', isBot: true, botDifficulty: 'hard' },
    ];
    const playerColors = { blue: 'user-1', red: 'bot-1' };

    expect(getBotDifficultyForTurn({
      mode: 'bot',
      routeBotDifficulty: 'easy',
      users,
      playerColors,
      activePlayer: 'red',
    })).toBe('easy');

    expect(getBotDifficultyForTurn({
      mode: 'multiplayer',
      users,
      playerColors,
      activePlayer: 'red',
    })).toBe('hard');
  });

  test('getFirstAvailableBotPlayer prefers an active on-board soldier', () => {
    const soldiersByColor = createSoldiersByColor({
      green: [
        { id: 13, color: 'green', onBoard: false, isOut: false },
        { id: 14, color: 'green', onBoard: true, isOut: false },
      ],
    });

    expect(getFirstAvailableBotPlayer(soldiersByColor, 'green')).toEqual({
      id: 14,
      color: 'green',
      onBoard: true,
      isOut: false,
    });
  });

  test('chooseBotAction selects a move when a bot has a usable card and soldier on board', () => {
    const cardsByColor = createCardsByColor({
      yellow: [{ id: 15, value: 4, used: false }],
    });
    const soldiersByColor = createSoldiersByColor({
      yellow: [{ id: 9, color: 'yellow', position: '1c', onBoard: true, isOut: false }],
    });

    expect(chooseBotAction(cardsByColor, soldiersByColor, 'yellow', { difficulty: 'hard', disableNoise: true })).toEqual(expect.objectContaining({
      type: 'movePlayer',
      payload: expect.objectContaining({
        color: 'yellow',
        steps: 4,
        soldier: { id: 9, color: 'yellow', position: '1c', onBoard: true, isOut: false },
      }),
    }));
  });

  test('chooseBotAction enters a new soldier when none are on the board', () => {
    const cardsByColor = createCardsByColor({
      red: [{ id: 7, value: 2, used: true }],
    });
    const soldiersByColor = createSoldiersByColor({
      red: [{ id: 5, color: 'red', onBoard: false, isOut: false }],
    });

    expect(chooseBotAction(cardsByColor, soldiersByColor, 'red', { difficulty: 'hard', disableNoise: true })).toEqual(expect.objectContaining({
      type: 'enterNewSoldier',
      payload: expect.objectContaining({ color: 'red' }),
    }));
  });

  test('chooseBotAction skips when no playable soldier is available', () => {
    const soldiersByColor = createSoldiersByColor({
      blue: [{ id: 1, color: 'blue', onBoard: false, isOut: true }],
    });

    expect(chooseBotAction(createCardsByColor(), soldiersByColor, 'blue', { difficulty: 'hard', disableNoise: true })).toEqual(expect.objectContaining({
      type: 'skipTurn',
      payload: {},
    }));
  });

  test('buildBotMultiplayerMessages keeps the human move contract for move actions', () => {
    const action = {
      type: 'movePlayer',
      payload: {
        color: 'yellow',
        steps: 4,
        soldier: { id: 9, color: 'yellow', position: '1c', onBoard: true, isOut: false },
      },
    };

    expect(buildBotMultiplayerMessages(action)).toEqual({
      selectedPlayer: { id: 9, color: 'yellow', position: '1c', onBoard: true, isOut: false },
      moveMessage: {
        type: 'movePlayer',
        payload: {
          color: 'yellow',
          steps: 4,
        },
      },
    });
  });

  test('emitMultiplayerBotTurn sends selected player first and then the move command', () => {
    const sendMessage = jest.fn();
    const sendMatchCommand = jest.fn();
    const cardsByColor = createCardsByColor({
      red: [{ id: 8, value: 2, used: false }],
    });
    const soldiersByColor = createSoldiersByColor({
      red: [{ id: 6, color: 'red', position: '1b', onBoard: true, isOut: false }],
    });

    const action = emitMultiplayerBotTurn({
      color: 'red',
      difficulty: 'hard',
      cardsByColor,
      soldiersByColor,
      connected: true,
      currentMatch: { id: 'match-1' },
      user: { id: 'host-1' },
      sendMessage,
      sendMatchCommand,
      disableNoise: true,
    });

    expect(action).toEqual(expect.objectContaining({ type: 'movePlayer' }));
    expect(sendMessage).toHaveBeenCalledWith('/app/player.getPlayer/match-1', {
      id: 6,
      color: 'red',
      position: '1b',
      onBoard: true,
      isOut: false,
    });
    expect(sendMatchCommand).toHaveBeenCalledWith({
      type: 'movePlayer',
      payload: { color: 'red', steps: 2 },
      matchId: 'match-1',
      playerId: 'host-1',
    });
    expect(sendMessage.mock.invocationCallOrder[0]).toBeLessThan(sendMatchCommand.mock.invocationCallOrder[0]);
  });

  test('emitMultiplayerBotTurn sends enter and skip actions without a selected-player sync message', () => {
    const sendMessage = jest.fn();
    const sendMatchCommand = jest.fn();

    emitMultiplayerBotTurn({
      color: 'red',
      difficulty: 'hard',
      cardsByColor: createCardsByColor({
        red: [{ id: 7, value: 2, used: true }],
      }),
      soldiersByColor: createSoldiersByColor({
        red: [{ id: 5, color: 'red', onBoard: false, isOut: false }],
      }),
      connected: true,
      currentMatch: { id: 'match-1' },
      user: { id: 'host-1' },
      sendMessage,
      sendMatchCommand,
      disableNoise: true,
    });

    emitMultiplayerBotTurn({
      color: 'green',
      difficulty: 'hard',
      cardsByColor: createCardsByColor(),
      soldiersByColor: createSoldiersByColor({
        green: [{ id: 16, color: 'green', onBoard: false, isOut: true }],
      }),
      connected: true,
      currentMatch: { id: 'match-1' },
      user: { id: 'host-1' },
      sendMessage,
      sendMatchCommand,
      disableNoise: true,
    });

    expect(sendMessage).not.toHaveBeenCalled();
    expect(sendMatchCommand).toHaveBeenNthCalledWith(1, {
      type: 'enterNewSoldier',
      payload: { color: 'red' },
      matchId: 'match-1',
      playerId: 'host-1',
    });
    expect(sendMatchCommand).toHaveBeenNthCalledWith(2, {
      type: 'skipTurn',
      payload: {},
      matchId: 'match-1',
      playerId: 'host-1',
    });
  });

  test('runBotTurn dispatches current player and executes a move action', () => {
    const dispatch = jest.fn();
    const movePlayer = jest.fn();
    const enterNewSoldier = jest.fn();
    const cardsByColor = createCardsByColor({
      red: [{ id: 8, value: 2, used: false }],
    });
    const soldiersByColor = createSoldiersByColor({
      red: [{ id: 6, color: 'red', position: '1b', onBoard: true, isOut: false }],
    });

    const action = runBotTurn({
      color: 'red',
      difficulty: 'hard',
      activePlayer: 'red',
      systemLang: 'en',
      showClone: false,
      dispatch,
      cardsByColor,
      soldiersByColor,
      movePlayer,
      enterNewSoldier,
    });

    expect(action).toEqual({
      type: 'movePlayer',
      payload: {
        color: 'red',
        steps: 2,
        soldier: { id: 6, color: 'red', position: '1b', onBoard: true, isOut: false },
        card: { id: 8, value: 2, used: false },
        targetPosition: '3b',
      },
      score: expect.any(Number),
      reasons: expect.any(Array),
      metrics: expect.any(Object),
    });
    expect(dispatch).toHaveBeenCalledWith(setCurrentPlayer({
      id: 6,
      color: 'red',
      position: '1b',
      onBoard: true,
      isOut: false,
    }));
    expect(movePlayer).toHaveBeenCalledWith({
      color: 'red',
      steps: 2,
      currentPlayer: { id: 6, color: 'red', position: '1b', onBoard: true, isOut: false },
      activePlayer: 'red',
      systemLang: 'en',
      showClone: false,
      dispatch,
    });
    expect(enterNewSoldier).not.toHaveBeenCalled();
  });

  test('runBotTurn advances the turn when the bot must skip', () => {
    const dispatch = jest.fn();
    const movePlayer = jest.fn();
    const enterNewSoldier = jest.fn();
    const soldiersByColor = createSoldiersByColor({
      green: [{ id: 16, color: 'green', onBoard: false, isOut: true }],
    });

    const action = runBotTurn({
      color: 'green',
      difficulty: 'hard',
      activePlayer: 'green',
      systemLang: 'en',
      showClone: false,
      dispatch,
      cardsByColor: createCardsByColor(),
      soldiersByColor,
      movePlayer,
      enterNewSoldier,
    });

    expect(action).toEqual(expect.objectContaining({ type: 'skipTurn', payload: {} }));
    expect(dispatch).toHaveBeenCalledWith(setActivePlayer());
    expect(dispatch).toHaveBeenCalledWith(resetTimer());
    expect(movePlayer).not.toHaveBeenCalled();
    expect(enterNewSoldier).not.toHaveBeenCalled();
  });
});
