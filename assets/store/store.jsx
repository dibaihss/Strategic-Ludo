import { configureStore } from '@reduxjs/toolkit';
import authReducer from './dbSlice';
import gameReducer from './gameSlice';
import themeReducer from './themeSlice';
import animationReducer from './animationSlice';
import asyncStorageReducer from './asyncStorageSlice';
import languageReducer from './languageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer,
    theme: themeReducer,
    animation: animationReducer,
    asyncStorage: asyncStorageReducer,
    language: languageReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});