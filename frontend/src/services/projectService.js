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

export const getProject = (projectId) => {
  return api.get(
    `/projects/${projectId}`
  );
};

export const getProjectsList = () => {
  return api.get(
    `/projects/list`
  );
};

export const createProject = (projectData) => {
  return api.post(
    `/projects/create_project`, projectData
  );
};

export const createProjectAttachment = (projectId, files) => {
  return api.post(
    `/projects/${projectId}/attachments`, files
  );
};

export async function updateProject(projectId, update = {}) {
  const response = await api.patch(`/projects/${projectId}`, update);
  return response.data;
}

export async function archiveProject(projectId) {
  const response = await api.post(`/projects/${projectId}/archive`);
  return response.data;
}

export async function unarchiveProject(projectId) {
  const response = await api.post(`/projects/${projectId}/unarchive`);
  return response.data;
}