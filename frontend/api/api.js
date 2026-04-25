import axios from "axios";

const baseURL = import.meta.env.VITE_baseURL;

const api = axios.create({
  baseURL,
});

//attaches token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;