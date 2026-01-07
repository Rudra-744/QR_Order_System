import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in (via Cookie)
  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      // Backend se pucho: "Kon hai bhai cookie me?"
      const res = await axios.get('http://localhost:5000/api/admin/me');
      setUser({ username: res.data.username });
    } catch (err) {
      setUser(null); // Cookie nahi mili ya expire ho gayi
    } finally {
      setLoading(false);
    }
  };

  const login = (username) => {
    setUser({ username }); // Sirf state update karo, cookie browser sambhal lega
    checkUserLoggedIn(); // Double confirm
  };

  const logout = async () => {
    try {
      await axios.get('http://localhost:5000/api/admin/logout');
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