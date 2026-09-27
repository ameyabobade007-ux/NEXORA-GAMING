import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
const C = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (localStorage.getItem("nexora_token"))
      api
        .get("/auth/me")
        .then((r) => setUser(r.data.user))
        .catch(() => localStorage.removeItem("nexora_token"))
        .finally(() => setLoading(false));
    else setLoading(false);
  }, []);
  const login = async (data) => {
    const r = await api.post("/auth/login", data);
    localStorage.setItem("nexora_token", r.data.token);
    setUser(r.data.user);
  };
  const register = async (data) => {
    const r = await api.post("/auth/register", data);
    localStorage.setItem("nexora_token", r.data.token);
    setUser(r.data.user);
  };
  const logout = () => {
    localStorage.removeItem("nexora_token");
    setUser(null);
  };
  return (
    <C.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </C.Provider>
  );
}
export const useAuth = () => useContext(C);
