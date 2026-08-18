import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

const getCookie = (name) => {
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
        const [key, ...value] = cookie.trim().split("=");

        if (key === name) {
            return decodeURIComponent(value.join("="));
        }
    }

    return null;
};

const isStateChangingMethod = (method) => {
    return ["POST", "PUT", "PATCH", "DELETE"].includes(
        method?.toUpperCase()
    );
};

const isAuthRoute = (url) => {
    if (!url) {
        return false;
    }

    return (
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/logout") ||
        url.includes("/auth/refresh")
    );
};

const forceLogout = async () => {
    try {
        // logout is intentionally allowed to work without a CSRF token
        // this is important when the user manually deleted a CSRF cookie
        await axios.post(
            `${API_URL}/auth/logout`,
            {},
            {
                withCredentials: true,
            }
        );
    } catch (error) {
        // server-side session may already be invalid
        // still redirecting to login
        console.debug("Forced logout request failed:", error);
    } finally {
        window.dispatchEvent(new Event("auth:logout"));

        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
    }
};

api.interceptors.request.use(
    async (config) => {
        // read token from cookie for state-changing methods
        const method = config.method?.toUpperCase();
        const url = config.url || "";

        if (!isStateChangingMethod(method) || isAuthRoute(url)) {
            return config;
        }

        const isRefreshRequest = url.includes("/auth/refresh");

        const csrfCookieName = isRefreshRequest
            ? "csrf_refresh_token"
            : "csrf_access_token";

        const csrfToken = getCookie(csrfCookieName);
        if (csrfToken) {
            config.headers = config.headers || {};
            config.headers["X-CSRF-TOKEN"] = csrfToken;
        }

        return config;
    },
    (error) => Promise.reject(error)
);


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        // don't continue with logout is getProfile is unsuccessful
        if (originalRequest.skipAuthRefresh) {
            return Promise.reject(error);
        }

        // no token refresh for authentication routes
        if (isAuthRoute(originalRequest.url)) {
            return Promise.reject(error);
        }

        const errorCode = error.response?.data?.error;

        // if CSRF failed, logout
        if (errorCode === "csrf_missing" || errorCode === "csrf_invalid") {
            await forceLogout();
            return Promise.reject(error);
        }

        // if token was explicitly revoked (e.g. password reset), force login without attempting refresh
        if (errorCode === "token_revoked") {
            await forceLogout();
            return Promise.reject(error);
        }

        // if request failed with 401 and hasn't been retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // the request interceptor reads csrf_refresh_token and sends X-CSRF-TOKEN
                await api.post("/auth/refresh");

                // retry the original request (now with the fresh access cookie)
                return await api(originalRequest);
            } catch (refreshError) {
                // if refresh cookie expired or is invalid
                await forceLogout();
                return Promise.reject(refreshError);
            }
        }

        // if the retried request failed again (invalid session, stale claims)
        if (error.response?.status === 401 && originalRequest._retry) {
            await forceLogout();
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default api;