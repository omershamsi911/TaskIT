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

// export const handleGoogleAuth = async (token, role = "customer") => {
//   const response = await api.post("/auth/login/google", {
//     token, role,
//   })

//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.detail || "Google authentication failed");
//   }

//   return response.json();
// };

export const handleGoogleAuth = async (
  token,
  role = "customer"
) => {
  try {
    const response = await api.post(
      "/auth/login/google",
      {
        token,
        credential: token,
        role,
      }
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.detail ||
      "Google authentication failed"
    );
  }
};