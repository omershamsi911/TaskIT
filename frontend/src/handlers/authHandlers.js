import api from "../api/api";

export const handleSignup = async (data) => {
  try {
    const response = await api.post("/auth/signup", data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "An error occurred during signup.";
  }
};

export const handleEmailLogin = async (data) => {
  try {
    const response = await api.post("/auth/login/email", data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Invalid credentials.";
  }
};

export const handlePhoneLogin = async (data) => {
  try {
    const response = await api.post("/auth/login/phone", data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Invalid credentials.";
  }
};