import api from "../api/axios";

export const getAllUsers = () => {
  return api.get(
    `/admin/users`
  );
};

export const getUser = (userId) => {
  return api.get(
    `/admin/users/${userId}`
  );
};

export const updateUser = (userId, roleName) => {
  return api.patch(
    `/admin/users/${userId}`,
      roleName
  );
};

export const getActivityLogs = (data) => {
  return api.get(
    `/admin/activity-logs`,
      data
  );
};