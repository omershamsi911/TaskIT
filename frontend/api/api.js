import axios from "axios";

const baseURL = import.meta.env.VITE_baseURL;

const api = axios.create({
  baseURL,
});

export default api;