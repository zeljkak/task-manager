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
        url.includes("/auth/refresh") ||
        url.includes("/auth/request-email-verification") ||
        url.includes("/auth/verify-email/") ||
        url.includes("/auth/forgot-password") ||
        url.includes("/auth/reset-password/") ||
        url.includes("/user/restore-request") ||
        url.includes("/user/restore/")
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
            window.location.href = "/login?forcedLogout=true";
        }
    }
};

// handles the issue of multiple sources calling refresh consecutively
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.request.use(
    async (config) => {
        // read token from cookie for state-changing methods
        const method = config.method?.toUpperCase();
        const url = config.url || "";
        const isRefreshRequest = url.includes("/auth/refresh");

        // allow CSRF header injection for /auth/refresh while keeping other GET/auth routes excluded
        if ((!isStateChangingMethod(method) && !isRefreshRequest) || (isAuthRoute(url) && !isRefreshRequest)) {
            return config;
        }

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

        // skip refresh attempt if the failed request WAS the refresh request itself
        if (originalRequest.url?.includes("/auth/refresh")) {
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

        // if token was explicitly revoked (e.g. password reset), force logout without attempting refresh
        if (errorCode === "token_revoked") {
            await forceLogout();
            return Promise.reject(error);
        }

        // skip refresh if explicitly disabled for this request (in AuthContext.jsx)
        if (originalRequest.skipRefresh === true) {
            return Promise.reject(error);
        }

        // if request failed with 401 and hasn't been retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // the request interceptor reads csrf_refresh_token and sends X-CSRF-TOKEN
                await api.post("/auth/refresh");
                processQueue(null);

                // retry the original request (now with the fresh access cookie)
                return await api(originalRequest);
            } catch (refreshError) {
                // if refresh cookie expired or is invalid
                processQueue(refreshError, null);
                await forceLogout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
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