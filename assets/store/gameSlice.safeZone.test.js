jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('./animationSlice.jsx', () => ({
  setBoxesPosition: jest.fn((payload) => ({ type: 'animation/setBoxesPosition', payload })),
}));

import { checkIfGotEnemy, setActivePlayer, resetTimer } from './gameSlice.jsx';
import { setBoxesPosition } from './animationSlice.jsx';

describe('checkIfGotEnemy safe zones', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not kick when the landing cell is a safe zone', () => {
    const dispatch = jest.fn();
    const getState = () => ({
      game: {
        blueSoldiers: [{ id: 1, color: 'blue', position: '1a', onBoard: true, isOut: false }],
        redSoldiers: [],
        yellowSoldiers: [],
        greenSoldiers: [],
      },
    });

    checkIfGotEnemy({ color: 'red', position: '1a' })(dispatch, getState);

    expect(setBoxesPosition).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(setActivePlayer());
    expect(dispatch).toHaveBeenCalledWith(resetTimer());
  });

  test('kicks enemy when landing on a non-safe cell', () => {
    const dispatch = jest.fn();
    const enemy = { id: 1, color: 'blue', position: '2a', onBoard: true, isOut: false };
    const getState = () => ({
      game: {
        blueSoldiers: [enemy],
        redSoldiers: [],
        yellowSoldiers: [],
        greenSoldiers: [],
      },
    });

    checkIfGotEnemy({ color: 'yellow', position: '2a' })(dispatch, getState);

    expect(setBoxesPosition).toHaveBeenCalledWith(
      expect.objectContaining({
        returenToBase: true,
        kickedPlayer: enemy,
      })
    );
  });
});
