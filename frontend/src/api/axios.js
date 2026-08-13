import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // if the refresh request itself failed, stop immediately to break loops
    if (originalRequest.url?.includes("/auth/refresh")) {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
        return new Promise(() => {});
      }
      return Promise.reject(error);
    }

    // if request failed with 401 and hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // if token was explicitly revoked (e.g. password reset), force login without attempting refresh
      if (error.response?.data?.error === "token_revoked") {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
          return new Promise(() => {});
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // call refresh endpoint using plain axios to avoid trigger loops
        await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // retry the original request (now with the fresh access cookie)
        return await api(originalRequest);
      } catch (refreshError) {
        // if refresh cookie expired or is invalid
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
          return new Promise(() => {});
        }
        return Promise.reject(refreshError);
      }
    }

    // if the retried request failed again (invalid session, stale claims)
    if (error.response?.status === 401 && originalRequest._retry) {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
        return new Promise(() => {});
      }
    }

    return Promise.reject(error);
  }
);

export default api;