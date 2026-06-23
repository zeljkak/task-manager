import api from "../api/axios";

export const getTasks = (filters = {}) => {
  return api.get(
    `/tasks`, {
        params: filters,
      });
};