import axios from "axios";
export const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("nexora_token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
