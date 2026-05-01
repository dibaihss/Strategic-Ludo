import React from 'react';
import { render } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Soldier from './Soldier';

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
}));

const createState = (overrides = {}) => {
    const baseState = {
        game: {
            currentPlayer: null,
        },
        animation: {
            boxesPosition: {},
            showClone: false,
            boxSize: 32,
        },
        theme: {
            current: {
                colors: {
                    blue: '#1E90FF',
                    selected: '#FFD166',
                },
            },
        },
    };

    return {
        ...baseState,
        ...overrides,
        game: {
            ...baseState.game,
            ...(overrides.game || {}),
        },
        animation: {
            ...baseState.animation,
            ...(overrides.animation || {}),
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
    };
};

describe('Soldier', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useDispatch.mockReturnValue(jest.fn());
        useSelector.mockImplementation((selector) => selector(createState()));
        jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 390, height: 844, scale: 1, fontScale: 1 });
    });

    afterEach(() => {
        Dimensions.get.mockRestore();
    });

    test('forwards selector props to the pressable and pawn graphic', () => {
        const { getByTestId } = render(
            <Soldier
                accessibilityLabel="soldier-3"
                color="blue"
                nativeID="soldier-native-3"
                onPress={() => { }}
                testID="soldier-3"
            />
        );

        expect(getByTestId('soldier-3')).toBeTruthy();
        expect(getByTestId('soldier-3-graphic')).toBeTruthy();
    });
});