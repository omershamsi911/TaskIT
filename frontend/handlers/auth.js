import api from '../api/api'

export const handleUserSignup = async (data) => {
  try {
    const res = await api.post("/auth/signup", {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: "customer",
    });

    return res.data;
  } catch (err) {
    throw err.response?.data || { detail: "Signup failed" };
  }
};

export const handleProviderSignup = async (data) => {
  try {
    const res = await api.post("/auth/signup", {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: "provider",
    });

    return res.data;
  } catch (err) {
    throw err.response?.data || { detail: "Signup failed" };
  }
};


export const handleEmailLogin = async (data) => {
  try {
    const res = await api.post("/auth/login/email", {
      email: data.email,
      password: data.password,
    });

    return res.data;
  } catch (err) {
    throw err.response?.data || { detail: "Login failed" };
  }
};

export const handlePhoneLogin = async (data) => {
  try {
    const res = await api.post("/auth/login/phone", {
      phone: data.phone,
      password: data.password, // OR otp
      otp: data.otp || null,
    });

    return res.data;
  } catch (err) {
    throw err.response?.data || { detail: "Login failed" };
  }
};

export const sendOTP = async (phone) => {
  try {
    const res = await api.post("/auth/send-otp", null, {
      params: { phone },
    });

    return res.data;
  } catch (err) {
    throw err.response?.data || { detail: "OTP send failed" };
  }
};

export const verifyOTP = async (phone, otp) => {
  try {
    const res = await api.post("/auth/verify-otp", null, {
      params: { phone, otp },
    });

    return res.data;
  } catch (err) {
    throw err.response?.data || { detail: "OTP verification failed" };
  }
};

export const refreshToken = async (refresh_token) => {
  try {
    const res = await api.post("/auth/refresh", null, {
      params: { refresh_token },
    });

    return res.data;
  } catch (err) {
    throw err.response?.data || { detail: "Refresh failed" };
  }
};