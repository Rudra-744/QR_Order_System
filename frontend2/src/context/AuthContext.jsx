import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/me`);
      setUser({ username: res.data.username });
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (username) => {
    setUser({ username });
    checkUserLoggedIn();
  };

  const logout = async () => {
    try {
      await axios.get(`${API_URL}/admin/logout`);
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
