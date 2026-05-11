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

export const handleGoogleAuth = async (token, role = "customer") => {
  const response = await fetch("http://localhost:8000/api/auth/login/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, role }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Google authentication failed");
  }

  return response.json();
};