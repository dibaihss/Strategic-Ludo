import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import animationReducer from './animationSlice';
import themeReducer from './themeSlice';
import languageReducer from './languageSlice';
import authReducer from './authSlice.jsx';

export const store = configureStore({
    reducer: {
        game: gameReducer,
        animation: animationReducer,
        theme: themeReducer,
        language: languageReducer,
        auth: authReducer,
    },
});

