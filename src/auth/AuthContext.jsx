import { createContext, useState, useEffect } from "react";
import { meApi, loginApi, logoutApi, verify2FALoginApi } from "../api/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await meApi();
      setUser(res.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
  const res = await loginApi(credentials);
  if (res.data.user) {
    setUser(res.data.user);
  }
  return res.data;
};
const completeTwoFactorLogin = async (userId, token) => {
  const res = await verify2FALoginApi(userId, token);
  setUser(res.data.user);
  return res.data;
};

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, completeTwoFactorLogin }}>
      {children}
    </AuthContext.Provider>
  );
};