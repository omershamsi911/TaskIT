import api from "../api/api";

// Category handlers
export const getCategories = async () => {
  const response = await api.get("/categories/");
  return response.data;
};