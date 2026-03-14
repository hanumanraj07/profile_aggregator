import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, setAuthToken } from "../services/api";

const TOKEN_KEY = "dpa_auth_token";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem(TOKEN_KEY) || "";
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setAuthToken(token);
        const data = await authApi.me();
        setUser(data.user);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setAuthToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (identifier, password) => {
    const data = await authApi.login({ identifier, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const registerStudent = async (payload) => {
    const data = await authApi.registerStudent(payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      registerStudent
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
