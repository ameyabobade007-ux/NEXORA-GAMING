import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nexora_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Prevent browsers/proxies from serving stale GET responses.
  if (config.method?.toLowerCase() === "get") {
    config.params = {
      ...(config.params || {}),
      _t: Date.now(),
    };
  }

  return config;
});