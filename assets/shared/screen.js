import { Dimensions } from 'react-native';

export const SMALL_SCREEN_BREAKPOINTS = Object.freeze({
    maxWidth: 475,
    maxHeight: 820,
});

export const isSmallScreenViewport = ({ width = 0, height = 0 } = {}) => (
    width <= SMALL_SCREEN_BREAKPOINTS.maxWidth || height <= SMALL_SCREEN_BREAKPOINTS.maxHeight
);

export const getIsSmallScreen = (dimensions = Dimensions.get('window')) => isSmallScreenViewport(dimensions);
