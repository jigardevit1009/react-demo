import { createSlice } from "@reduxjs/toolkit";

// Read persisted authentication state from localStorage (or default to logged out)
const savedToken = localStorage.getItem("auth_token");
const savedUser = localStorage.getItem("auth_user")
  ? JSON.parse(localStorage.getItem("auth_user"))
  : null;

const initialState = {
  user: savedUser,
  token: savedToken,
  isAuthenticated: !!savedToken, // true only if a valid token exists
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // 1. Action: loginSuccess -> Persists token & user to localStorage
    loginSuccess: (state, action) => {
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
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("auth_user", JSON.stringify(state.user));
      }
    },
  },
});

export const { loginSuccess, logout, updateUserProfile } = authSlice.actions;

export default authSlice.reducer;
