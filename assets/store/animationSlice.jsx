import { createSlice } from '@reduxjs/toolkit';
import {
    Dimensions
} from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const isSmallScreen = windowWidth < 375 || windowHeight < 667;

const initialState = {
    boxSize: isSmallScreen ? 25 : 50,
    showClone: false,
    boxesPosition: null
};
// new game
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
        }
    }
});

export const { 
    setSourcePosition, 
    setTargetPosition, 
    setShowClone, 
    setAnimatedValue,
    setBoxesPosition
} = animationSlice.actions;

export default animationSlice.reducer;