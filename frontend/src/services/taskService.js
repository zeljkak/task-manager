import api from "../api/axios";

export async function getTasks(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
          params.append(key,value);
      }
  });

  const response = await api.get(`/tasks?${params.toString()}`);
  return response.data;
};