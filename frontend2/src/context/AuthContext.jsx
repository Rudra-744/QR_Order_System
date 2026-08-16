import React, { createContext, useState, useEffect, useContext } from "react";
import apiClient from "../api/apiClient";

const AuthContext = createContext();

const initialToken = localStorage.getItem("token");
if (initialToken) {
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${initialToken}`;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      const res = await apiClient.get(`/admin/me`);
      setUser({ username: res.data.username, restaurantId: res.data.restaurantId });
    } catch (err) {
      setUser(null);
      localStorage.removeItem("token");
      delete apiClient.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const login = (token, username, restaurantId) => {
    localStorage.setItem("token", token);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser({ username, restaurantId });
    checkUserLoggedIn();
  };

  const logout = async () => {
    try {
      await apiClient.get(`/admin/logout`);
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      localStorage.removeItem("token");
      delete apiClient.defaults.headers.common["Authorization"];
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
