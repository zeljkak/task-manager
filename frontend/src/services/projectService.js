import api from "../api/axios";

export const getProjects = () => {
  return api.get(
    `/projects`
  );
};