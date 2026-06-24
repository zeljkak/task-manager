import api from "../api/axios";

export const getTaskStatuses = () => {
  return api.get(
    `/task_statuses`
  );
};