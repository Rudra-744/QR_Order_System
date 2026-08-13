import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

axios.defaults.withCredentials = true;

const initialToken = localStorage.getItem("token");
if (initialToken) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${initialToken}`;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      const res = await axios.get(`${API_URL}/admin/me`);
      setUser({ username: res.data.username, restaurantId: res.data.restaurantId });
    } catch (err) {
      setUser(null);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const login = (token, username, restaurantId) => {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser({ username, restaurantId });
    checkUserLoggedIn();
  };

  const logout = async () => {
    try {
      await axios.get(`${API_URL}/admin/logout`);
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
