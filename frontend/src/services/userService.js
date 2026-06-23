import api from "../api/axios";

export const restoreAccount = (token) => {
  return api.get(
    `/users/restore/${token}`
  );
};

export const getProfile = () => {
  return api.get(
    `/users/profile`
  );
};