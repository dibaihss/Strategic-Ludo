jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('./animationSlice.jsx', () => ({
  setBoxesPosition: jest.fn((payload) => ({ type: 'animation/setBoxesPosition', payload })),
}));

import reducer, {
  applyServerStateSnapshot,
  removeColorFromAvailableColors,
  setPlayerColors,
  updateSoldiersPosition,
} from './gameSlice.jsx';

describe('applyServerStateSnapshot after player removal', () => {
  test('does not restore kicked player soldiers from a later sync snapshot', () => {
    let state = reducer(undefined, { type: '@@INIT' });

    state = reducer(state, updateSoldiersPosition({ color: 'red', position: '' }));
    state = reducer(state, removeColorFromAvailableColors({ color: 'red' }));
    state = reducer(state, setPlayerColors({
      blue: 1,
      yellow: 3,
      green: 4,
    }));

    const cleanedRedPositions = state.redSoldiers.map((soldier) => soldier.position);
    const activePlayerBeforeSnapshot = state.activePlayer;

    state = reducer(state, applyServerStateSnapshot({
      activePlayer: 'red',
      currentPlayer: {
        id: 5,
        color: 'red',
        position: '1b',
        initialPosition: '1red',
        onBoard: true,
        isOut: false,
      },
      soldiers: {
        red: [
          { id: 5, color: 'red', position: '1b', initialPosition: '1red', onBoard: true, isOut: false },
          { id: 6, color: 'red', position: '2b', initialPosition: '2red', onBoard: true, isOut: false },
          { id: 7, color: 'red', position: '3b', initialPosition: '3red', onBoard: true, isOut: false },
          { id: 8, color: 'red', position: '4b', initialPosition: '4red', onBoard: true, isOut: false },
        ],
      },
      cards: {
        red: [
          { id: 7, used: true, value: 1 },
        ],
      },
    }));

    expect(state.activePlayer).toBe(activePlayerBeforeSnapshot);
    expect(state.currentPlayer?.color).not.toBe('red');
    expect(state.redSoldiers.map((soldier) => soldier.position)).toEqual(cleanedRedPositions);
    expect(state.availableTypes).not.toContain('red');
    expect(state.playerColors.red).toBeUndefined();
    expect(state.redCards).toHaveLength(6);
    expect(state.redCards[0].used).toBe(false);
  });
});