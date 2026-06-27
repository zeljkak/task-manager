import api from "../api/axios";

export const getProjects = (filters = {}) => {
  return api.get(
    `/projects`, {
        params: filters,
      });
};