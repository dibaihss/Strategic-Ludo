import { createSlice } from '@reduxjs/toolkit';
import {
    Dimensions
} from 'react-native';
import { getIsSmallScreen } from '../shared/screen.js';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const isSmallScreen = getIsSmallScreen({ width: windowWidth, height: windowHeight });

const initialState = {
    boxSize: isSmallScreen ? 25 : 50,
    showClone: false,
    boxesPosition: null
};

const animationSlice = createSlice({
    name: 'animation',
    initialState,
    reducers: {
        setSourcePosition: (state, action) => {
            state.sourcePosition = action.payload;
        },
        setTargetPosition: (state, action) => {
            state.targetPosition = action.payload;
        },
        setShowClone: (state, action) => {
            state.showClone = action.payload;
        },
        setAnimatedValue: (state, action) => {
            state.animatedValue = action.payload;
        },
        setBoxesPosition: (state, action) => {
            state.boxesPosition = action.payload
        },
        resetAnimationState: () => ({ ...initialState }),
    }
});

export const { 
    setSourcePosition, 
    setTargetPosition, 
    setShowClone, 
    setAnimatedValue,
    setBoxesPosition,
    resetAnimationState,
} = animationSlice.actions;

export default animationSlice.reducer;