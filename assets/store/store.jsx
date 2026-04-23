import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import sessionReducer from './sessionSlice';
import gameReducer from './gameSlice';
import themeReducer from './themeSlice';
import animationReducer from './animationSlice';
import asyncStorageReducer from './asyncStorageSlice';
import languageReducer from './languageSlice';
import audioReducer from './audioSlice';
import tutorialReducer from './tutorialSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    session: sessionReducer,
    game: gameReducer,
    theme: themeReducer,
    animation: animationReducer,
    asyncStorage: asyncStorageReducer,
    language: languageReducer,
    audio: audioReducer,
    tutorial: tutorialReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
