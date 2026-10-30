import api from "../api/axios";

export const getRoles = () => {
  return api.get(
    `/roles`
  );
};

export const getRole = (roleId) => {
  return api.get(
    `/roles/${roleId}`
  );
};