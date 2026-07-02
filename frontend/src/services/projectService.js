import api from "../api/axios";

export async function getProjects(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
          params.append(key,value);
      }
  });

  const response = await api.get(`/projects?${params.toString()}`);
  return response.data;
};

export const getProjectsList = () => {
  return api.get(
    `/projects/list`
  );
};