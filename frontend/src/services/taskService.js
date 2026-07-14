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

export const createTask = (taskData) => {
  return api.post(
    `/tasks/create_task`, taskData
  );
};

export const createTaskAttachment = (taskId, files) => {
  return api.post(
    `/tasks/${taskId}/attachments`, files
  );
};

export const getTask = (taskId) => {
  return api.post(
    `/tasks/${taskId}`
  );
};

export async function updateTask(taskId, update = {}) {
  const response = await api.patch(`/tasks/${taskId}`, update);
  return response.data;
}