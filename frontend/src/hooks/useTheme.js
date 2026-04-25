// src/hooks/useTheme.js
import { useSelector } from "react-redux";

export const useTheme = () => {
  return useSelector((state) => state.theme);
};