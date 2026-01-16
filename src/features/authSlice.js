import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: localStorage.getItem("name") ? { name: localStorage.getItem("name"), role: localStorage.getItem("role") } : null,
  role: localStorage.getItem("role") || null,
  token: localStorage.getItem("token") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.role = action.payload.user.role;
      state.token = action.payload.token;

      // Ensure sync with localStorage (Login.jsx does this, but good to ensure)
      localStorage.setItem("name", action.payload.user.name);
      localStorage.setItem("role", action.payload.user.role);
      localStorage.setItem("token", action.payload.token);
    },
    logout: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      state.user = null;
      state.role = null;
      state.token = null;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
