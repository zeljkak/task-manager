import api from "../api/axios";

export const checkTokenForResetPassword = (token) => {
  return api.get(
    `/auth/reset-password/${token}`
  );
};

export const resetPassword = (token, data) => {
  return api.post(
    `/auth/reset-password/${token}`,
    data
  );
};

export const login = (data) => {
  return api.post(
    `/auth/login`,
    data
  );
}