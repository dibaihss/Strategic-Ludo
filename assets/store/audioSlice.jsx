import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMuted: false,
  musicVolume: 0.1,
  sfxVolume: 1,
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
    setMusicVolume: (state, action) => {
      state.musicVolume = Math.max(0, Math.min(1, action.payload));
    },
    setSfxVolume: (state, action) => {
      state.sfxVolume = Math.max(0, Math.min(1, action.payload));
    },
  },
});

export const { toggleMute, setMusicVolume, setSfxVolume } = audioSlice.actions;
export default audioSlice.reducer;
