import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    sourcePosition: null,
    targetPosition: null,
    showClone: false,
    animatedValue: { x: 0, y: 0 }
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
        }
    }
});

export const { 
    setSourcePosition, 
    setTargetPosition, 
    setShowClone, 
    setAnimatedValue 
} = animationSlice.actions;

export default animationSlice.reducer;