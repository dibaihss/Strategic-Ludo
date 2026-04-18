import {
    canControlColor,
    calculateNewPositionForPlayer,
    movePlayerCore,
    handleEnterNewSoldierCore,
    sendMoveUpdateCore,
} from './Bases.logic';
import { enterNewSoldier, checkIfCardUsed } from '../assets/store/gameSlice.jsx';
import { setBoxesPosition } from '../assets/store/animationSlice.jsx';

jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

jest.mock('../assets/store/gameSlice.jsx', () => ({
    enterNewSoldier: jest.fn((color) => ({ type: 'game/enterNewSoldier', payload: color })),
    checkIfCardUsed: jest.fn((payload) => ({ type: 'game/checkIfCardUsed', payload })),
}));

jest.mock('../assets/store/animationSlice.jsx', () => ({
    setBoxesPosition: jest.fn((payload) => ({ type: 'animation/setBoxesPosition', payload })),
}));

describe('Bases.logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('canControlColor supports single and dual color ownership', () => {
        expect(canControlColor('red', 'red')).toBe(true);
        expect(canControlColor(['red', 'blue'], 'blue')).toBe(true);
        expect(canControlColor(['red', 'blue'], 'green')).toBe(false);
        expect(canControlColor(null, 'green')).toBe(false);
    });

    test('calculateNewPositionForPlayer handles board movement and out-of-board cases', () => {
        expect(calculateNewPositionForPlayer({ position: '1a', isOut: false, color: 'blue' }, 2)).toBe('3a');
        expect(calculateNewPositionForPlayer({ position: '12a', isOut: false, color: 'blue' }, 1)).toBe('1b');
        expect(calculateNewPositionForPlayer({ position: '6a', isOut: false, color: 'red' }, 1)).toBe('');
        expect(calculateNewPositionForPlayer({ position: '6a', isOut: true, color: 'red' }, 1)).toBeUndefined();
    });

    test('movePlayerCore blocks when no selected player', () => {
        const dispatch = jest.fn();
        movePlayerCore({
            color: 'red',
            steps: 2,
            currentPlayer: null,
            activePlayer: 'red',
            systemLang: 'en',
            showClone: false,
            dispatch,
        });

        expect(dispatch).not.toHaveBeenCalled();
    });

    test('movePlayerCore blocks when selected player color is wrong', () => {
        const dispatch = jest.fn();
        movePlayerCore({
            color: 'red',
            steps: 2,
            currentPlayer: { position: '1a', isOut: false, color: 'blue' },
            activePlayer: 'blue',
            systemLang: 'en',
            showClone: false,
            dispatch,
        });

        expect(dispatch).not.toHaveBeenCalled();
    });

    test('movePlayerCore blocks when active player does not match selected player', () => {
        const dispatch = jest.fn();
        movePlayerCore({
            color: 'blue',
            steps: 2,
            currentPlayer: { position: '1a', isOut: false, color: 'blue' },
            activePlayer: 'red',
            systemLang: 'en',
            showClone: false,
            dispatch,
        });

        expect(dispatch).not.toHaveBeenCalled();
    });

    test('movePlayerCore stops when clone animation is active', () => {
        const dispatch = jest.fn();
        movePlayerCore({
            color: 'blue',
            steps: 2,
            currentPlayer: { position: '1a', isOut: false, color: 'blue' },
            activePlayer: 'blue',
            systemLang: 'en',
            showClone: true,
            dispatch,
        });

        expect(dispatch).not.toHaveBeenCalled();
    });

    test('movePlayerCore dispatches card check and movement payload on a valid board move', () => {
        const dispatch = jest.fn();
        movePlayerCore({
            color: 'blue',
            steps: 2,
            currentPlayer: { position: '1a', isOut: false, color: 'blue' },
            activePlayer: 'blue',
            systemLang: 'en',
            showClone: false,
            dispatch,
        });

        expect(checkIfCardUsed).toHaveBeenCalledWith({ color: 'blue', steps: 2 });
        expect(setBoxesPosition).toHaveBeenCalledWith(expect.objectContaining({ newPosition: '3a' }));
        expect(dispatch).toHaveBeenNthCalledWith(1, { type: 'game/checkIfCardUsed', payload: { color: 'blue', steps: 2 } });
        expect(dispatch).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                type: 'animation/setBoxesPosition',
                payload: expect.objectContaining({ newPosition: '3a' }),
            })
        );
    });

    test('movePlayerCore dispatches out-of-board payload with axis by color', () => {
        const dispatch = jest.fn();
        movePlayerCore({
            color: 'red',
            steps: 1,
            currentPlayer: { position: '6a', isOut: false, color: 'red' },
            activePlayer: 'red',
            systemLang: 'en',
            showClone: false,
            dispatch,
        });

        expect(setBoxesPosition).toHaveBeenCalledWith({ ySteps: 1, newPosition: '' });
    });

    test('handleEnterNewSoldierCore enforces turn and dispatches on valid turn', () => {
        const dispatch = jest.fn();
        handleEnterNewSoldierCore({
            activePlayer: 'blue',
            color: 'red',
            systemLang: 'en',
            dispatch,
        });
        expect(dispatch).not.toHaveBeenCalled();

        handleEnterNewSoldierCore({
            activePlayer: 'red',
            color: 'red',
            systemLang: 'en',
            dispatch,
        });
        expect(enterNewSoldier).toHaveBeenCalledWith('red');
        expect(dispatch).toHaveBeenCalledWith({ type: 'game/enterNewSoldier', payload: 'red' });
    });

    test('sendMoveUpdateCore routes typed and untyped messages correctly', () => {
        const sendMatchCommand = jest.fn();
        const sendMessage = jest.fn();

        sendMoveUpdateCore({
            connected: false,
            message: { type: 'movePlayer', payload: { color: 'red', steps: 2 } },
            sendMatchCommand,
            currentMatch: { id: 'match-1' },
            user: { id: 'u-1' },
            sendMessage,
        });
        expect(sendMatchCommand).not.toHaveBeenCalled();
        expect(sendMessage).not.toHaveBeenCalled();

        sendMoveUpdateCore({
            connected: true,
            message: { type: 'movePlayer', payload: { color: 'red', steps: 2 } },
            sendMatchCommand,
            currentMatch: { id: 'match-1' },
            user: { id: 'u-1' },
            sendMessage,
        });
        expect(sendMatchCommand).toHaveBeenCalledWith({
            type: 'movePlayer',
            payload: { color: 'red', steps: 2 },
            matchId: 'match-1',
            playerId: 'u-1',
        });

        sendMoveUpdateCore({
            connected: true,
            message: { custom: true },
            sendMatchCommand,
            currentMatch: { id: 'match-1' },
            user: { id: 'u-1' },
            sendMessage,
        });
        expect(sendMessage).toHaveBeenCalledWith('/app/player.Move/match-1', { custom: true });
    });
});
