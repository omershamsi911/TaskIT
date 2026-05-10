import api from "../api/api";

// User handlers
export const getMe = async () => {
  const response = await api.get("/users/me");
  return response.data;
};