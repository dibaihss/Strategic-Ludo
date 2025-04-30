import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const USER_ACCOUNTS_KEY = 'ludo_user_accounts';
const ACTIVE_USER_KEY = 'ludo_active_user';
const GAME_SETTINGS_KEY = 'ludo_settings';
const RECENT_MATCHES_KEY = 'ludo_recent_matches';

// Initial state
const initialState = {
  userAccounts: [],
  activeUser: null,
  gameSettings: {
    sound: true,
    music: true,
    vibration: true,
    darkMode: false,
    language: 'en',
  },
  recentMatches: [],
  loading: false,
  error: null,
};

export const addUserAccount = createAsyncThunk(
  'asyncStorage/addUserAccount',
  async ({ user, token }, { getState, rejectWithValue, dispatch }) => {
    try {
      if (!user || !user.id) {
        return rejectWithValue('Invalid user object');
      }

      // Get current accounts
      const { userAccounts } = getState().asyncStorage;
      
      // Prepare user data to store
      const userToStore = {
        userId: user.id,
        username: user.username || user.name,
        email: user.email,
        isGuest: !!user.isGuest,
        token: token,
        lastLogin: new Date().toISOString(),
        profilePic: user.profilePic || null
      };
      
      // Check if user already exists
      const existingIndex = userAccounts.findIndex(u => u.userId === user.id);
      let updatedAccounts = [...userAccounts];
      
      if (existingIndex >= 0) {
        // Update existing account
        updatedAccounts[existingIndex] = {
          ...updatedAccounts[existingIndex],
          ...userToStore
        };
      } else {
        // Add new account
        updatedAccounts.push(userToStore);
      }
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(USER_ACCOUNTS_KEY, JSON.stringify(updatedAccounts));
      
      // Also set as active user
      await dispatch(setActiveUser(userToStore));
      
      return updatedAccounts;
    } catch (error) {
      console.error('Failed to add user account:', error);
      return rejectWithValue('Failed to add user account');
    }
  }
);

export const removeUserAccount = createAsyncThunk(
  'asyncStorage/removeUserAccount',
  async (userId, { getState, rejectWithValue, dispatch }) => {
    try {
      const { userAccounts, activeUser } = getState().asyncStorage;
      
      // Filter out the user
      const updatedAccounts = userAccounts.filter(u => u.userId !== userId);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(USER_ACCOUNTS_KEY, JSON.stringify(updatedAccounts));
      
      // If removing active user, clear active user
      if (activeUser && activeUser.userId === userId) {
        await dispatch(clearActiveUser());
      }
      
      return updatedAccounts;
    } catch (error) {
      console.error('Failed to remove user account:', error);
      return rejectWithValue('Failed to remove user account');
    }
  }
);

export const setActiveUser = createAsyncThunk(
  'asyncStorage/setActiveUser',
  async (user, { rejectWithValue }) => {
    try {
      if (!user) {
        await AsyncStorage.removeItem(ACTIVE_USER_KEY);
        return null;
      }
      
      await AsyncStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Failed to set active user:', error);
      return rejectWithValue('Failed to set active user');
    }
  }
);

export const loadActiveUser = createAsyncThunk(
  'asyncStorage/loadActiveUser',
  async (_, { rejectWithValue }) => {
    try {
      const userJson = await AsyncStorage.getItem(ACTIVE_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Failed to load active user:', error);
      return rejectWithValue('Failed to load active user');
    }
  }
);

export const clearActiveUser = createAsyncThunk(
  'asyncStorage/clearActiveUser',
  async (_, { rejectWithValue }) => {
    try {
      await AsyncStorage.removeItem(ACTIVE_USER_KEY);
      return null;
    } catch (error) {
      console.error('Failed to clear active user:', error);
      return rejectWithValue('Failed to clear active user');
    }
  }
);

// Thunks for game settings
export const loadGameSettings = createAsyncThunk(
  'asyncStorage/loadGameSettings',
  async (_, { rejectWithValue }) => {
    try {
      const settingsJson = await AsyncStorage.getItem(GAME_SETTINGS_KEY);
      return settingsJson ? JSON.parse(settingsJson) : initialState.gameSettings;
    } catch (error) {
      console.error('Failed to load game settings:', error);
      return rejectWithValue('Failed to load game settings');
    }
  }
);

export const updateGameSettings = createAsyncThunk(
  'asyncStorage/updateGameSettings',
  async (settings, { getState, rejectWithValue }) => {
    try {
      const { gameSettings } = getState().asyncStorage;
      const updatedSettings = { ...gameSettings, ...settings };
      
      await AsyncStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify(updatedSettings));
      return updatedSettings;
    } catch (error) {
      console.error('Failed to update game settings:', error);
      return rejectWithValue('Failed to update game settings');
    }
  }
);

// Thunks for recent matches
export const loadRecentMatches = createAsyncThunk(
  'asyncStorage/loadRecentMatches',
  async (_, { rejectWithValue }) => {
    try {
      const matchesJson = await AsyncStorage.getItem(RECENT_MATCHES_KEY);
      return matchesJson ? JSON.parse(matchesJson) : [];
    } catch (error) {
      console.error('Failed to load recent matches:', error);
      return rejectWithValue('Failed to load recent matches');
    }
  }
);

export const addRecentMatch = createAsyncThunk(
  'asyncStorage/addRecentMatch',
  async (match, { getState, rejectWithValue }) => {
    try {
      const { recentMatches } = getState().asyncStorage;
      
      // Add new match at the beginning and limit to 10 matches
      const updatedMatches = [match, ...recentMatches].slice(0, 10);
      
      await AsyncStorage.setItem(RECENT_MATCHES_KEY, JSON.stringify(updatedMatches));
      return updatedMatches;
    } catch (error) {
      console.error('Failed to add recent match:', error);
      return rejectWithValue('Failed to add recent match');
    }
  }
);

// Create the slice
const asyncStorageSlice = createSlice({
  name: 'asyncStorage',
  initialState,
  reducers: {
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // User accounts

    // Add user account
    builder.addCase(addUserAccount.fulfilled, (state, action) => {
      state.userAccounts = action.payload;
      state.error = null;
    });
    builder.addCase(addUserAccount.rejected, (state, action) => {
      state.error = action.payload;
    });

    // Remove user account
    builder.addCase(removeUserAccount.fulfilled, (state, action) => {
      state.userAccounts = action.payload;
      state.error = null;
    });

    // Active user
    builder.addCase(setActiveUser.fulfilled, (state, action) => {
      state.activeUser = action.payload;
      state.error = null;
    });
    builder.addCase(clearActiveUser.fulfilled, (state) => {
      state.activeUser = null;
    });

    // Game settings
    builder.addCase(loadGameSettings.fulfilled, (state, action) => {
      state.gameSettings = action.payload;
    });
    builder.addCase(updateGameSettings.fulfilled, (state, action) => {
      state.gameSettings = action.payload;
    });

    // Recent matches
    builder.addCase(loadRecentMatches.fulfilled, (state, action) => {
      state.recentMatches = action.payload;
    });
    builder.addCase(addRecentMatch.fulfilled, (state, action) => {
      state.recentMatches = action.payload;
    });
  },
});

// Export actions
export const { resetState } = asyncStorageSlice.actions;

// Export reducer
export default asyncStorageSlice.reducer;