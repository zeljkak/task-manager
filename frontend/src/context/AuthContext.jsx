import {createContext, useState, useEffect} from "react";
import {getProfile} from "../services/userService.js";
import {logout} from "../services/authService.js";
import {acquireRefreshLock, releaseRefreshLock} from "../api/axios.js"
import {clearCsrfTokens} from "../api/csrfStore.js";
import api from "../api/axios.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app mount/refresh
  useEffect(() => {
    async function checkAuthStatus() {
      const params = new URLSearchParams(window.location.search);
      const forcedLogout = params.get("forcedLogout") === "true";

      if (forcedLogout) {
        window.history.replaceState({},"", window.location.pathname);
      }

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

  // handle forced logout from axios
  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
    };

    window.addEventListener("auth:logout", handleForcedLogout);

    return () => {
      window.removeEventListener("auth:logout", handleForcedLogout);
    };
  }, []);

  // handle multiple tabs sync in browser
  useEffect(() => {
    const handleStorageChange = (event) => {
      // if another tab cleared the logout flag or CSRF tokens
      if (event.key === "app_logout_event" && event.newValue) {
        // clean up the item so it doesn't linger
        localStorage.removeItem("app_logout_event");

        setUser(null);
        clearCsrfTokens(false); // prevents duplicate storage event dispatch
        if (window.location.pathname !== "/login") {
          window.location.href = "/login?forcedLogout=true";
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // proactive UX refresh
  useEffect(() => {
    // only set up background refresh if a user is logged in
    if (!user) return;

    // refresh every 10 minutes
    const TEN_MINUTES = 10 * 60 * 1000;
    let lastRefreshTime = Date.now();

    const triggerRefresh = async () => {
      const gotLock = await acquireRefreshLock();
      if (!gotLock) return; // another tab is actively refreshing
      try {
        await api.post("/auth/refresh");
        lastRefreshTime = Date.now();
      } catch (err) {
        console.warn("Proactive refresh skipped or failed:", err);
      } finally {
        releaseRefreshLock();
      }
    };

    const interval = setInterval(triggerRefresh, TEN_MINUTES);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && Date.now() - lastRefreshTime > TEN_MINUTES) {
        triggerRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

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
      clearCsrfTokens();
      localStorage.setItem("app_logout_event", Date.now().toString());
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}