import api from "../api/axios";

export const getNotifications = ({ unreadOnly = false, page = 1, perPage = 50 } = {}) => {
  return api.get("/notifications", {
    params: {
      unreadOnly,
      page,
      perPage,
    },
  });
};

export const getUnreadCount = () => {
  return api.get("/notifications/unread-count");
};

export const markNotificationRead = (notificationId) => {
  return api.patch(`/notifications/${notificationId}/read`);
};

export const markAllNotificationsRead = () => {
  return api.patch("/notifications/read-all");
};
