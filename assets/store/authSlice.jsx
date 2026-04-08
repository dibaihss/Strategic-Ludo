import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  API_URL,
  isE2EMode,
  createE2EUser,
  getAuthToken,
  requireAuthToken,
} from "./sessionApiShared.jsx";

export const updateUserStatus = createAsyncThunk(
  "auth/updateUserStatus",
  async (status, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const user = state.auth.user;
      const authResult = await requireAuthToken(getState, rejectWithValue, "updateUserStatus");
      if (authResult.error) return authResult.error;
      const { token } = authResult;

      console.log(`Updating user ${user.id} status to: ${status}`);

      const response = await fetch(`${API_URL}/users/${user.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to update user status:", errorText);
        return rejectWithValue("Failed to update user status");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating user status:", error);
      return rejectWithValue("Network error while updating user status");
    }
  }
);

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

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      if (isE2EMode) {
        const user = {
          ...createE2EUser(),
          email: userData.email || "e2e.user@example.com",
          name: "E2E User",
        };
        await AsyncStorage.setItem("user", JSON.stringify(user));
        return user;
      }

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });

      if (!response.ok) return rejectWithValue("Login failed");

      const result = await response.json();

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

export const loginGuest = createAsyncThunk(
  "auth/loginGuest",
  async (_, { rejectWithValue }) => {
    try {
      if (isE2EMode) {
        const user = createE2EUser();
        await AsyncStorage.setItem("user", JSON.stringify(user));
        return user;
      }

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

      if (isGuest && userId) {
        const token = await getAuthToken(getState);
        const headers = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/users/${userId}`, {
          method: "DELETE",
          headers,
        });

        if (!response.ok) {
          console.error("Failed to delete guest user");
        }
      }

      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");

      return rejectWithValue("Logout failed");
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
    loading: false,
    offlineModus: false,
    currentUserPage: null,
  },
  reducers: {
    clearAuth: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
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
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload;
        state.token = action.payload?.token || null;
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
        state.token = action.payload?.token || null;
        if (state.user) {
          state.user.isGuest = true;
        }
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
      })
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.loading = false;

        if (state.user && state.user.id === action.payload.id) {
          state.user = {
            ...state.user,
            ...action.payload,
          };

          AsyncStorage.setItem("user", JSON.stringify(state.user));
        }
      })
      .addCase(updateUserStatus.rejected, (state) => {
        state.loading = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoggedIn = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || null;
      });
  },
});

export const { clearAuth, setUser, setLoggedIn, setCurrentUserPage, setOfflineModus } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;

export default authSlice.reducer;
