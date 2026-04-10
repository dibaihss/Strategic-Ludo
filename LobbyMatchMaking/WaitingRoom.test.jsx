jest.mock('../assets/store/sessionSlice.jsx', () => ({
  addBotToMatch: jest.fn((payload) => ({ type: 'session/addBotToMatch', payload })),
  fetchCurrentMatch: jest.fn(),
  updateMatch: jest.fn((payload) => ({ type: 'session/updateMatch', payload })),
  updateMatchStatus: jest.fn(),
  leaveMatch: jest.fn(),
}));

jest.mock('../assets/store/gameSlice.jsx', () => ({
  setPlayerColors: jest.fn((payload) => ({ type: 'game/setPlayerColors', payload })),
  updateSoldiersPosition: jest.fn((payload) => ({ type: 'game/updateSoldiersPosition', payload })),
  removeColorFromAvailableColors: jest.fn((payload) => ({ type: 'game/removeColorFromAvailableColors', payload })),
  setActivePlayer: jest.fn(() => ({ type: 'game/setActivePlayer' })),
}));

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as RN from 'react-native';
import WaitingRoom from './WaitingRoom';
import { useWebSocket } from '../assets/shared/webSocketConnection.jsx';

RN.Modal = ({ visible, children }) => (visible ? children : null);

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

jest.mock('react-native-toast-message', () => {
  const Toast = () => null;
  Toast.show = jest.fn();
  return {
    __esModule: true,
    default: Toast,
  };
});

const createState = () => ({
  theme: {
    current: {
      colors: {
        accent: '#2c7',
        disabled: '#999',
        text: '#111',
        textSecondary: '#666',
        background: '#fff',
        card: '#f4f4f4',
        border: '#ddd',
        inputBackground: '#eee',
        buttonText: '#fff',
        success: '#0a0',
        error: '#c00',
        yellow: '#ff0',
        blue: '#00f',
        red: '#f00',
        green: '#0f0',
      },
    },
  },
  language: { systemLang: 'en' },
  auth: { user: { id: 'user-1', name: 'Host' } },
  session: {
    loading: false,
    currentMatch: {
      id: 'match-1',
      name: 'Game Room 1',
      status: 'waiting',
      users: [{ id: 'user-1', name: 'Host' }],
    },
  },
});

describe('WaitingRoom', () => {
  let dispatchMock;
  let sendMessageMock;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatchMock = jest.fn();
    sendMessageMock = jest.fn();
    useDispatch.mockReturnValue(dispatchMock);
    useSelector.mockImplementation((selector) => selector(createState()));
    useWebSocket.mockReturnValue({
      connected: false,
      subscribe: jest.fn(),
      sendMessage: sendMessageMock,
    });
  });

  test('stores selected bot difficulty when the host adds a bot', () => {
    const navigation = { navigate: jest.fn() };
    const { getByTestId } = render(
      <WaitingRoom navigation={navigation} route={{ params: { join: false } }} />
    );

    fireEvent.press(getByTestId('waiting-room-add-bot-button'));
    fireEvent.press(getByTestId('waiting-room-bot-difficulty-hard-button'));

    expect(dispatchMock).toHaveBeenCalledWith(expect.objectContaining({
      type: 'session/addBotToMatch',
      payload: expect.objectContaining({
        matchId: 'match-1',
        bot: expect.objectContaining({
          isBot: true,
          botDifficulty: 'hard',
        }),
      }),
    }));

    expect(sendMessageMock).toHaveBeenCalledWith(
      '/app/waitingRoom.gameStarted/match-1',
      expect.objectContaining({
        type: 'botAdded',
        bot: expect.objectContaining({
          botDifficulty: 'hard',
        }),
      })
    );
  });
});
