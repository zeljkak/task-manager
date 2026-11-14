import { createContext, useContext, useCallback, useMemo } from "react";
import useNotificationsWebSocket from "../hooks/useNotificationsWebSocket.js";
import { markNotificationRead, markAllNotificationsRead } from "../services/notificationService.js";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const {
    notifications,
    unreadCount,
    loading,
    connected,
    error,
    refresh,
    prependOrReplace,
    applyUnreadCount,
    markLocalRead,
    markAllLocalRead,
  } = useNotificationsWebSocket({ enabled: true });

  const markRead = useCallback(
    async (notificationId) => {
      const res = await markNotificationRead(notificationId);
      markLocalRead(notificationId);
      applyUnreadCount(res.data.unreadCount);
      if (res.data.notification) {
        prependOrReplace(res.data.notification);
      }
      return res;
    },
    [markLocalRead, applyUnreadCount, prependOrReplace]
  );

  const markAllRead = useCallback(async () => {
    const res = await markAllNotificationsRead();
    markAllLocalRead();
    applyUnreadCount(res.data.unreadCount ?? 0);
    return res;
  }, [markAllLocalRead, applyUnreadCount]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      connected,
      error,
      refresh,
      markRead,
      markAllRead,
    }),
    [
      notifications,
      unreadCount,
      loading,
      connected,
      error,
      refresh,
      markRead,
      markAllRead,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
