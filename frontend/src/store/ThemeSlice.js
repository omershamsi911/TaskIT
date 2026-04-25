// src/store/themeSlice.js
import { createSlice } from "@reduxjs/toolkit";

const getAltBackground = (cr) => {
  const r = parseInt(cr.slice(1,3), 16);
  const g = parseInt(cr.slice(3,5), 16);
  const b = parseInt(cr.slice(5,7), 16);
  return `rgb(${Math.max(0, r-12)}, ${Math.max(0, g-12)}, ${Math.max(0, b-12)})`;
};

const getLightInk = (ik) => {
  const r = parseInt(ik.slice(1,3), 16);
  const g = parseInt(ik.slice(3,5), 16);
  const b = parseInt(ik.slice(5,7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.4)`;
};

const initialState = {
  C: "#FF5733",
  CR: "#F5F0E6",
  IK: "#1A1A1A",
  CR_ALT: getAltBackground("#F5F0E6"),
  LIGHT_IK: getLightInk("#1A1A1A"),
  mode: "light", 
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.C = action.payload.C;
      state.CR = action.payload.CR;
      state.IK = action.payload.IK;
      state.CR_ALT = getAltBackground(action.payload.CR);
      state.LIGHT_IK = getLightInk(action.payload.IK);
      state.mode = action.payload.mode || "light"; 
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;