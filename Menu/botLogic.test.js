import {
  chooseBotAction,
  getFirstAvailableBotPlayer,
  getPlayerOwner,
  getSoldiersForColor,
  isBotControlledPlayer,
  runBotTurn,
} from './botLogic';
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
      yellow: [{ id: 9, color: 'yellow', onBoard: true, isOut: false }],
    });

    expect(chooseBotAction(cardsByColor, soldiersByColor, 'yellow')).toEqual({
      type: 'movePlayer',
      payload: { color: 'yellow', steps: 4 },
    });
  });

  test('chooseBotAction enters a new soldier when none are on the board', () => {
    const cardsByColor = createCardsByColor({
      red: [{ id: 7, value: 2, used: true }],
    });
    const soldiersByColor = createSoldiersByColor({
      red: [{ id: 5, color: 'red', onBoard: false, isOut: false }],
    });

    expect(chooseBotAction(cardsByColor, soldiersByColor, 'red')).toEqual({
      type: 'enterNewSoldier',
      payload: { color: 'red' },
    });
  });

  test('chooseBotAction skips when no playable soldier is available', () => {
    const soldiersByColor = createSoldiersByColor({
      blue: [{ id: 1, color: 'blue', onBoard: false, isOut: true }],
    });

    expect(chooseBotAction(createCardsByColor(), soldiersByColor, 'blue')).toEqual({
      type: 'skipTurn',
      payload: {},
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
      red: [{ id: 6, color: 'red', onBoard: true, isOut: false }],
    });

    const action = runBotTurn({
      color: 'red',
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
      payload: { color: 'red', steps: 2 },
    });
    expect(dispatch).toHaveBeenCalledWith(setCurrentPlayer({
      id: 6,
      color: 'red',
      onBoard: true,
      isOut: false,
    }));
    expect(movePlayer).toHaveBeenCalledWith({
      color: 'red',
      steps: 2,
      currentPlayer: { id: 6, color: 'red', onBoard: true, isOut: false },
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
      activePlayer: 'green',
      systemLang: 'en',
      showClone: false,
      dispatch,
      cardsByColor: createCardsByColor(),
      soldiersByColor,
      movePlayer,
      enterNewSoldier,
    });

    expect(action).toEqual({ type: 'skipTurn', payload: {} });
    expect(dispatch).toHaveBeenCalledWith(setActivePlayer());
    expect(dispatch).toHaveBeenCalledWith(resetTimer());
    expect(movePlayer).not.toHaveBeenCalled();
    expect(enterNewSoldier).not.toHaveBeenCalled();
  });
});
