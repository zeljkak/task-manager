import React, { createContext, useState, useEffect, useContext } from "react";
import {getProfile} from "../services/userService.js";
import {logout} from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app mount/refresh
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const res = await getProfile();
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuthStatus();
  }, []);

  const loginUser = async () => {
  try {
    const res = await getProfile();
    setUser(res.data.user);
  } catch (err) {
    setUser(null);
  }
};

  const logoutUser = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Backend logout failed, clearing local session anyway...", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access to Auth
export function useAuth() {
  return useContext(AuthContext);
}