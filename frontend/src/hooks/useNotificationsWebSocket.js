import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/useAuth.js";
import { getNotifications, getUnreadCount } from "../services/notificationService.js";
import { getCsrfAccess, rehydrateCsrfFromStorage } from "../api/csrfStore.js";
import { refreshSession } from "../api/axios.js";

const API_URL = import.meta.env.VITE_API_URL;
const MAX_SOCKET_RETRY_ATTEMPTS = 8;

// track active socket globally to prevent duplicate instances during remounts
let globalSocket = null;
let globalConnecting = false;

// maintains an authenticated Socket.IO connection and live inbox state
// refreshes the JWT session before (re)connecting so idle tabs do not
// hammer the server with expired access cookies or race token rotation

export default function useNotificationsWebSocket({ enabled = true } = {}) {
  const { user } = useAuth();
  const disposedRef = useRef(false);
  const retryAttemptsRef = useRef(0);
  const retryTimerRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const [listRes, countRes] = await Promise.all([
        getNotifications({ page: 1, perPage: 50 }),
        getUnreadCount(),
      ]);
      setNotifications(listRes.data.notifications || []);
      setUnreadCount(
        countRes.data.unreadCount ?? listRes.data.unreadCount ?? 0
      );
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError(err.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!enabled || !user || !API_URL) {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }
      setConnected(false);
      return undefined;
    }

    disposedRef.current = false;
    retryAttemptsRef.current = 0;

    // reuse existing global socket if already created or connecting
    if (!globalSocket) {
      globalSocket = io(API_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        autoConnect: false,
        reconnection: false,
      });
    }

    const socket = globalSocket;

    const clearRetryTimer = () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };

    const scheduleReconnect = (reason) => {
      if (disposedRef.current) return;
      if (retryAttemptsRef.current >= MAX_SOCKET_RETRY_ATTEMPTS) {
        console.warn("Socket reconnect stopped after max attempts");
        return;
      }

      clearRetryTimer();
      const attempt = retryAttemptsRef.current;
      const waitMs = Math.min(1000 * 2 ** attempt, 15000);
      retryTimerRef.current = setTimeout(() => {
        safeConnect(reason);
      }, waitMs);
    };

    const safeConnect = async (reason) => {
      if (disposedRef.current || globalConnecting) return;
      if (socket.connected) {
        setConnected(true);
        return;
      }

      globalConnecting = true;
      try {
        // proactively refresh the session via Axios before opening the socket connection
        await refreshSession();
        rehydrateCsrfFromStorage();

        // attach the fresh CSRF access token to socket handshake headers
        const csrfToken = getCsrfAccess();
        if (csrfToken) {
          socket.io.opts.extraHeaders = {
            ...(socket.io.opts.extraHeaders || {}),
            "X-CSRF-TOKEN": csrfToken,
          };
        }

        if (disposedRef.current) return;
        socket.connect();
      } catch (err) {
        console.warn("Socket connect deferred; session refresh failed:", err?.message || err);
        setConnected(false);

        // stop retrying if the session is explicitly unauthorized (refresh token expired/invalid)
        if (err.response?.status === 401) {
          console.warn("Session expired. Stopping socket reconnection attempts.");
          return;
        }

        retryAttemptsRef.current += 1;
        scheduleReconnect("connect_error");
      } finally {
        globalConnecting = false;
      }
    };

    const handleConnect = () => {
      retryAttemptsRef.current = 0;
      clearRetryTimer();
      setConnected(true);
    };

    const handleDisconnect = (reason) => {
      setConnected(false);
      if (!disposedRef.current && reason !== "io client disconnect") {
        retryAttemptsRef.current += 1;
        scheduleReconnect("disconnect");
      }
    };

    const handleConnectError = (err) => {
      console.warn("Notification socket error:", err?.message || err);
      setConnected(false);
      retryAttemptsRef.current += 1;
      scheduleReconnect("connect_error");
    };

    const handleNotification = (payload) => {
      if (!payload?.id) return;
      setNotifications((prev) => {
        const without = prev.some((n) => n.id === payload.id)
          ? prev.filter((n) => n.id !== payload.id)
          : prev;
        return [payload, ...without].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      });
      setUnreadCount((prev) => prev + (payload.isRead ? 0 : 1));
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("notification", handleNotification);

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;

      // give returning users a fresh chance by resetting retry attempts
      retryAttemptsRef.current = 0;
      clearRetryTimer();

      if (!socket.connected && !globalConnecting) {
        safeConnect("visibility");
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    safeConnect("mount");

    return () => {
      disposedRef.current = true;
      clearRetryTimer();
      document.removeEventListener("visibilitychange", handleVisibility);

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("notification", handleNotification);
      setConnected(false);
    };
  }, [enabled, user]);

  const prependOrReplace = useCallback((notification) => {
    setNotifications((prev) => {
      const without = prev.filter((n) => n.id !== notification.id);
      return [notification, ...without].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    });
  }, []);

  const applyUnreadCount = useCallback((count) => {
    if (typeof count === "number") {
      setUnreadCount(count);
    }
  }, []);

  const markLocalRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  }, []);

  const markAllLocalRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    setNotifications,
    unreadCount,
    loading,
    connected,
    error,
    refresh: loadNotifications,
    prependOrReplace,
    applyUnreadCount,
    markLocalRead,
    markAllLocalRead,
  };
}
