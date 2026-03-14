import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

const instance = axios.create({
  baseURL: API_URL,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor: handle 401 Unauthorized globally
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      // redirect to login so user can authenticate again
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default instance;