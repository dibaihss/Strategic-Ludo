import React from 'react';
import { Dimensions } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import Bases from './Bases';
import { useWebSocket } from '../assets/shared/webSocketConnection.jsx';
import {
    checkIfCardUsed,
    enterNewSoldier,
    setActivePlayer,
    resetTimer,
} from '../assets/store/gameSlice.jsx';
import { setBoxesPosition } from '../assets/store/animationSlice.jsx';

jest.mock('./Soldier', () => () => null);

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

jest.mock('@expo/vector-icons/Feather', () => 'Feather');

jest.mock('../assets/store/gameSlice.jsx', () => ({
    checkIfCardUsed: jest.fn((payload) => ({ type: 'game/checkIfCardUsed', payload })),
    enterNewSoldier: jest.fn((color) => ({ type: 'game/enterNewSoldier', payload: color })),
    setActivePlayer: jest.fn(() => ({ type: 'game/setActivePlayer' })),
    resetTimer: jest.fn(() => ({ type: 'game/resetTimer' })),
}));

jest.mock('../assets/store/animationSlice.jsx', () => ({
    setBoxesPosition: jest.fn((payload) => ({ type: 'animation/setBoxesPosition', payload })),
}));

const createState = (overrides = {}) => {
    const baseState = {
        game: {
            currentPlayer: { id: 5, position: '1b', color: 'red', isOut: false },
            activePlayer: 'red',
            blueSoldiers: [],
            redSoldiers: [{ id: 5, position: '1b', color: 'red', isOut: false }],
            yellowSoldiers: [],
            greenSoldiers: [],
            blueCards: [],
            redCards: [{ id: 10, used: false, value: 3 }],
            yellowCards: [],
            greenCards: [],
            currentPlayerColor: 'red',
        },
        theme: {
            current: {
                name: 'light',
                colors: {
                    button: '#fff',
                    buttonBorder: '#111',
                    buttonText: '#111',
                    red: '#f00',
                    yellow: '#ff0',
                    blue: '#00f',
                    green: '#0f0',
                    border: '#333',
                    shadowColor: '#999',
                },
            },
        },
        animation: { showClone: false },
        language: { systemLang: 'en' },
        auth: { user: { id: 'user-1' } },
        session: { currentMatch: { id: 'match-1' } },
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
                colors: {
                    ...baseState.theme.current.colors,
                    ...(overrides.theme?.current?.colors || {}),
                },
            },
        },
        animation: {
            ...baseState.animation,
            ...(overrides.animation || {}),
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

describe('Bases component', () => {
    let dispatchMock;
    let subscribeMock;
    let unsubscribeMock;
    let sendMessageMock;
    let sendMatchCommandMock;

    beforeEach(() => {
        jest.clearAllMocks();
        dispatchMock = jest.fn();
        subscribeMock = jest.fn();
        unsubscribeMock = jest.fn();
        sendMessageMock = jest.fn();
        sendMatchCommandMock = jest.fn();

        jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 430, height: 932 });
        useDispatch.mockReturnValue(dispatchMock);
        configureSelectors(createState());
        useWebSocket.mockReturnValue({
            connected: false,
            subscribe: subscribeMock,
            sendMessage: sendMessageMock,
            sendMatchCommand: sendMatchCommandMock,
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('renders card controls from redux state', () => {
        const { getByTestId } = render(<Bases />);
        expect(getByTestId('move-card-red-3')).toBeTruthy();
        expect(getByTestId('enter-soldier-red')).toBeTruthy();
    });

    test('offline card press triggers local move flow', () => {
        const { getByTestId } = render(<Bases />);
        fireEvent.press(getByTestId('move-card-red-3'));

        expect(checkIfCardUsed).toHaveBeenCalledWith({ color: 'red', steps: 3 });
        expect(setBoxesPosition).toHaveBeenCalledWith(expect.objectContaining({ newPosition: '4b' }));
        expect(dispatchMock).toHaveBeenCalledWith({ type: 'game/checkIfCardUsed', payload: { color: 'red', steps: 3 } });
    });

    test('offline enter press triggers local enter flow', () => {
        const { getByTestId } = render(<Bases />);
        fireEvent.press(getByTestId('enter-soldier-red'));

        expect(enterNewSoldier).toHaveBeenCalledWith('red');
        expect(dispatchMock).toHaveBeenCalledWith({ type: 'game/enterNewSoldier', payload: 'red' });
    });

    test('online authorized card press sends match command', () => {
        configureSelectors(createState({ game: { currentPlayerColor: 'red' } }));
        useWebSocket.mockReturnValue({
            connected: true,
            subscribe: jest.fn(() => ({ unsubscribe: unsubscribeMock })),
            sendMessage: sendMessageMock,
            sendMatchCommand: sendMatchCommandMock,
        });

        const { getByTestId } = render(<Bases />);
        fireEvent.press(getByTestId('move-card-red-3'));

        expect(sendMatchCommandMock).toHaveBeenCalledWith({
            type: 'movePlayer',
            payload: { color: 'red', steps: 3 },
            matchId: 'match-1',
            playerId: 'user-1',
        });
        expect(checkIfCardUsed).not.toHaveBeenCalled();
    });

    test('online unauthorized card press does not send match command', () => {
        configureSelectors(createState({ game: { currentPlayerColor: 'blue' } }));
        useWebSocket.mockReturnValue({
            connected: true,
            subscribe: jest.fn(() => ({ unsubscribe: unsubscribeMock })),
            sendMessage: sendMessageMock,
            sendMatchCommand: sendMatchCommandMock,
        });

        const { getByTestId } = render(<Bases />);
        fireEvent.press(getByTestId('move-card-red-3'));

        expect(sendMatchCommandMock).not.toHaveBeenCalled();
    });

    test('subscription callback handles move, enter, and skip commands', () => {
        subscribeMock = jest.fn(() => ({ unsubscribe: unsubscribeMock }));
        useWebSocket.mockReturnValue({
            connected: true,
            subscribe: subscribeMock,
            sendMessage: sendMessageMock,
            sendMatchCommand: sendMatchCommandMock,
        });

        render(<Bases />);
        expect(subscribeMock).toHaveBeenCalledWith('/topic/playerMove/match-1', expect.any(Function));

        const callback = subscribeMock.mock.calls[0][1];
        callback({ type: 'movePlayer', payload: { color: 'red', steps: 3 } });
        callback({ type: 'enterNewSoldier', payload: { color: 'red' } });
        callback({ type: 'skipTurn' });

        expect(checkIfCardUsed).toHaveBeenCalledWith({ color: 'red', steps: 3 });
        expect(enterNewSoldier).toHaveBeenCalledWith('red');
        expect(setActivePlayer).toHaveBeenCalledTimes(1);
        expect(resetTimer).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith({ type: 'game/setActivePlayer' });
        expect(dispatchMock).toHaveBeenCalledWith({ type: 'game/resetTimer' });
    });
});
