import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthState } from "../types";

// Helper to safely parse JSON from localStorage
const getStoredUser = (): User | null => {
  try {
    const item = localStorage.getItem("auth_user");
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn("Failed to parse stored auth user:", error);
    localStorage.removeItem("auth_user");
    return null;
  }
};

const savedToken = localStorage.getItem("auth_token");
const savedUser = getStoredUser();

const initialState: AuthState = {
  user: savedUser,
  token: savedToken,
  isAuthenticated: !!savedToken, // true only if a valid token exists
};

interface LoginPayload {
  user: User;
  token: string;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // 1. Action: loginSuccess -> Persists token & user to localStorage
    loginSuccess: (state, action: PayloadAction<LoginPayload>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      // Save to localStorage
      localStorage.setItem("auth_token", action.payload.token);
      localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
    },

    // 2. Action: logout -> Clears localStorage and resets state
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      // Clear from localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    },

    // 3. Action: updateUserProfile
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("auth_user", JSON.stringify(state.user));
      }
    },
  },
});

export const { loginSuccess, logout, updateUserProfile } = authSlice.actions;

export default authSlice.reducer;
