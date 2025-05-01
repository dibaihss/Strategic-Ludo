import { createSlice } from '@reduxjs/toolkit';
import { getLocales } from 'expo-localization';
import { errorMsgs, gameInstructions } from '../shared/hardCodedData';

// Get the device's primary language code
const deviceLanguage = getLocales()[0]?.languageCode || "en";

const initialState = {
    systemLang: deviceLanguage,
    gameInstructions,
    errorMsgs
};

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setSystemLanguage: (state, action) => {
            state.systemLang = action.payload;
        },
    }
});
export const { 
  setSystemLanguage
} = languageSlice.actions;

export default languageSlice.reducer;

