import api from "../api/axios";

export const restoreRequest = (email) => {
  return api.post(
    `/users/restore-request`,
      email
  );
};

export const checkTokenForRestore = (token) => {
  return api.get(
    `/users/restore/${token}`
  );
};

export const restoreAccount = (token) => {
  return api.post(
    `/users/restore/${token}`
  );
};

export const getProfile = (skipRefresh = false) => {
  return api.get(
    `/users/profile`, {
        skipRefresh,
    });
};

export const changePassword = (data) => {
  return api.post(
    `/users/change-password`,
      data
  );
};

export const getUsers = () => {
  return api.get(
    `/users`
  );
};

export const deleteAccount = () => {
  return api.delete(
    `/users/delete`
  );
};