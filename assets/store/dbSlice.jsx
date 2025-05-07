import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native"; // Import Platform

// --- START: API URL Configuration ---
const PRODUCTION_API_URL =
  "https://strategic-ludo-srping-boot.onrender.com/api";

// URL options based on platform and environment
const LOCALHOST_API_URL = "http://localhost:8080/api"; // Default for iOS simulator
const ANDROID_API_URL = "http://192.168.178.130:8080/api"; // Android-specific URL with port

let API_URL;
if (__DEV__) {
  if (Platform.OS === "android") {
    API_URL = ANDROID_API_URL;
  } else {
    API_URL = LOCALHOST_API_URL;
  }
} else {
  API_URL = PRODUCTION_API_URL;
}

console.log(`Using API URL: ${API_URL} on platform: ${Platform.OS}`); // Enhanced logging
// --- END: API URL Configuration ---
// Add this thunk after your other API calls
export const updateUserStatus = createAsyncThunk(
  "auth/updateUserStatus",
  async (status, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      let user = state.auth.user;

      console.log(`Updating user ${user.id} status to: ${status}`);

      // Make API request to update user status
      const response = await fetch(`${API_URL}/users/${user.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to update user status:", errorText);
        return rejectWithValue("Failed to update user status");
      }

      const updatedUser = await response.json();
      console.log("User status updated successfully:", updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Error updating user status:", error);
      return rejectWithValue("Network error while updating user status");
    }
  }
);

// Register user thunk
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.username,
          email: userData.email,
          password: userData.password,
          status: true,
        }),
      });

      if (!response.ok) return rejectWithValue("Registration failed");
      return await response.json();
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

// Load user from storage
export const loadStoredUser = createAsyncThunk(
  "auth/loadStoredUser",
  async (_, { rejectWithValue }) => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const storedToken = await AsyncStorage.getItem("token");

      if (!storedUser) {
        return rejectWithValue("No stored user found");
      }

      return {
        user: JSON.parse(storedUser),
        token: storedToken,
      };
    } catch (error) {
      console.error("Error loading stored user:", error);
      return rejectWithValue("Failed to load user data");
    }
  }
);

// Login user thunk - add storage
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      // Keep your existing API call
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });

      if (!response.ok) return rejectWithValue("Login failed");

      const result = await response.json();

      // Store the user data in AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(result));
      if (result.token) {
        await AsyncStorage.setItem("token", result.token);
      }

      return result;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

// Guest login thunk - add storage
export const loginGuest = createAsyncThunk(
  "auth/loginGuest",
  async (_, { rejectWithValue }) => {
    try {
      const guestName = `Guest_${Math.floor(Math.random() * 10000)}`;

      const response = await fetch(`${API_URL}/guest-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: guestName,
          isGuest: true,
          status: "active",
        }),
      });

      if (!response.ok) return rejectWithValue("Guest login failed");

      const result = await response.json();
      result.isGuest = true;

      // Store the guest user data
      await AsyncStorage.setItem("user", JSON.stringify(result));
      if (result.token) {
        await AsyncStorage.setItem("token", result.token);
      }

      return result;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const user = state.auth.user;
      const isGuest = user?.isGuest;
      const userId = user?.id;

      // If it's a guest user, delete from database
      if (isGuest && userId) {
        // Make API call to delete the guest user
        const response = await fetch(`${API_URL}/users/${userId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // Include auth token if required
            Authorization: `Bearer ${state.auth.token}`,
          },
        });

        if (!response.ok) {
          console.error("Failed to delete guest user");
        }
      }

      // Clear stored credentials regardless of user type
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      // We still want to clear local storage even if API call fails
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");

      return rejectWithValue("Logout failed");
    }
  }
);

// Fetch available matches
export const fetchMatches = createAsyncThunk(
  "auth/fetchMatches",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/sessions`);
      if (!response.ok) return rejectWithValue("Failed to fetch matches");
      return await response.json();
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

// Create a new match
export const createMatch = createAsyncThunk(
  "auth/createMatch",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;

      // Create match
      const response = await fetch(`${API_URL}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Game Room ${Math.floor(Math.random() * 1000)}`,
          status: "waiting",
        }),
      });

      if (!response.ok) return rejectWithValue("Failed to create match");
      const match = await response.json();

      // Join the match automatically
      if (userId) {
        await fetch(`${API_URL}/sessions/${match.id}/users/${userId}`, {
          method: "POST",
        });
      }
      return match;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);
// Join an existing match
export const joinMatch = createAsyncThunk(
  "auth/joinMatch",
  async (matchId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;

      if (!userId) return rejectWithValue("Not logged in");

      const response = await fetch(
        `${API_URL}/sessions/${matchId}/users/${userId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) return rejectWithValue("Failed to join match");

      // Get updated match data
      const matchResponse = await fetch(`${API_URL}/sessions/${matchId}`);
      return await matchResponse.json();
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);
export const leaveMatch = createAsyncThunk(
  "auth/leaveMatch",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userId = state.auth.user?.id;
      const token = state.auth.token;
      if (!userId) {
        return rejectWithValue("User is not logged in");
      }

      if (!payload) {
        return rejectWithValue("No match ID provided");
      }
      // Make API request to leave the match
      const response = await fetch(
        `${API_URL}/sessions/${payload.matchId}/users/${payload.playerId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to leave match:", errorText);
        return rejectWithValue("Failed to leave match");
      }

      return { matchId: payload.matchId, userId: payload.playerId };
    } catch (error) {
      console.error("Error leaving match:", error);
      return rejectWithValue("Network error while leaving match");
    }
  }
);
export const fetchCurrentMatch = createAsyncThunk(
  "auth/fetchCurrentMatch",
  async (matchId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      // Fetch match data from your API
      const response = await fetch(`${API_URL}/sessions/${matchId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        return rejectWithValue("Failed to fetch match data");
      }

      const matchData = await response.json();
      return matchData;
    } catch (error) {
      return rejectWithValue("Network error while fetching match data");
    }
  }
);
// unused
export const updateMatchStatus = createAsyncThunk(
  "auth/updateMatchStatus",
  async (session, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      // Make API request to update session status
      const response = await fetch(`${API_URL}/sessions/${session.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(session),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(
          errorData.message || "Failed to update match status"
        );
      }

      const updatedMatch = await response.json();
      return updatedMatch;
    } catch (error) {
      console.error("Error updating match status:", error);
      return rejectWithValue("Network error while updating match status");
    }
  }
);
export const deleteMatch = createAsyncThunk(
  "auth/deleteMatch",
  async (matchId, { rejectWithValue, getState }) => {
    try {
      console.log("Deleting match with ID:", matchId);
      const state = getState();
      const token = state.auth.token;

      // Delete match
      const response = await fetch(`${API_URL}/sessions/${matchId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) return rejectWithValue("Failed to delete match");
      const match = await response.json();

      return match;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
    user: null,
    token: null,
    error: null,
    matches: [],
    currentMatch: null,
    currentUserPage: null,
    loading: false,
    offlineModus: false,
  },
  reducers: {
    clearAuth: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
      state.currentMatch = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    updateMatch: (state, action) => {
      // Update match data (e.g., from WebSocket)
      const index = state.matches.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.matches[index] = action.payload;
      } else {
        state.matches.push(action.payload);
      }
      if (state.currentMatch?.id === action.payload.id) {
        state.currentMatch = action.payload;
      }
    },
    setLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    setCurrentUserPage: (state, action) => {
      state.currentUserPage = action.payload;
    },
    setOfflineModus: (state, action) => {
      state.offlineModus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginGuest.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload;
        state.user.isGuest = true; // Mark user as guest
      })
      .addCase(loginGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadStoredUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadStoredUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loadStoredUser.rejected, (state) => {
        state.loading = false;
        // We don't set an error here since this is a normal scenario
        // when the user hasn't logged in before
      })

      // Fetch matches
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
      })
      .addCase(fetchMatches.rejected, (state) => {
        state.loading = false;
      })

      // Create match
      .addCase(createMatch.pending, (state) => {
        state.loading = true;
      })
      .addCase(createMatch.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMatch = action.payload;
        state.matches.push(action.payload);
      })
      .addCase(createMatch.rejected, (state) => {
        state.loading = false;
      })
      .addCase(joinMatch.pending, (state) => {
        state.loading = true;
      })
      .addCase(joinMatch.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMatch = action.payload;
        const index = state.matches.findIndex(
          (m) => m.id === action.payload.id
        );
        if (index !== -1) {
          state.matches[index] = action.payload;
        }
      })
      .addCase(joinMatch.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.loading = false;

        // If it's the current user, update the user object
        if (state.user && state.user.id === action.payload.id) {
          state.user = {
            ...state.user,
            ...action.payload,
          };

          // Update local storage
          AsyncStorage.setItem("user", JSON.stringify(state.user));
        }

        // If the user is in the current match, update them there too
        if (state.currentMatch?.users) {
          const userIndex = state.currentMatch.users.findIndex(
            (u) => u.id === action.payload.id
          );
          if (userIndex !== -1) {
            state.currentMatch.users[userIndex] = {
              ...state.currentMatch.users[userIndex],
              ...action.payload,
            };
          }
        }
      })
      .addCase(updateUserStatus.rejected, (state) => {
        state.loading = false;
      })
      .addCase(leaveMatch.pending, (state) => {
        state.loading = true;
      })
      .addCase(leaveMatch.fulfilled, (state, action) => {
        state.loading = false;

        const { matchId, userId } = action.payload;
        // Remove the user from the current match
        if (state.currentMatch?.id === matchId) {
          state.currentMatch.users = state.currentMatch.users.filter(
            (user) => user.id !== userId
          );
          // If the current user is leaving, clear the currentMatch
          if (state.user?.id === userId) {
            state.currentMatch = null;
          }
        }
        // Optionally, update the matches list
        const matchIndex = state.matches.findIndex(
          (match) => match.id === matchId
        );
        if (matchIndex !== -1) {
          state.matches[matchIndex].users = state.matches[
            matchIndex
          ].users.filter((user) => user.id !== userId);
        }
      })
      .addCase(leaveMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  updateMatch,
  clearAuth,
  setUser,
  setLoggedIn,
  setCurrentUserPage,
  setOfflineModus,
} = authSlice.actions;

// Simple selectors
export const selectUser = (state) => state.auth.user;
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectMatches = (state) => state.auth.matches;
export const selectCurrentMatch = (state) => state.auth.currentMatch;

export default authSlice.reducer;
