import axios from "axios";
import { getCsrfAccess, getCsrfRefresh, setCsrfTokens, clearCsrfTokens} from "./csrfStore.js";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

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
        url.includes("/users/restore-request") ||
        url.includes("/users/restore/")
    );
};

// soft logout: clears client state and redirects without hitting /auth/logout (avoids revoking valid refresh sessions)
const softLogout = async (reason) => {
    console.warn(`[LOGOUT TRIGGERED] Soft Logout execution. Reason: ${reason}`);

    // clear CSRF storage so invalid tokens don't persist
    clearCsrfTokens();

    try {
        await axios.post(`${API_URL}/auth/clear-cookies`, {}, { withCredentials: true });
    } catch (e) {
        console.log("Failed to clear cookies during soft logout", e);
    }

    // notify all other open tabs to log out instantly
    localStorage.setItem("app_logout_event", Date.now().toString());

    window.dispatchEvent(new Event("auth:logout"));

    if (window.location.pathname !== "/login") {
        window.location.href = "/login?forcedLogout=true";
    }
};

// helper function to delay execution (wait)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

// cross-tab lock helper using localStorage
export const acquireRefreshLock = async () => {
    const lockKey = "refresh_lock";
    const lockTimeout = 5000;
    const pollInterval = 100;
    const maxRetries = 50; // aligns 5s polling window with the 5s lock timeout

    for (let i = 0; i < maxRetries; i++) {
        const currentTime = Date.now();
        const lock = localStorage.getItem(lockKey);

        if (!lock || currentTime - parseInt(lock, 10) > lockTimeout) {
            localStorage.setItem(lockKey, currentTime.toString());
            return true;
        }
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
    return false;
};

export const releaseRefreshLock = () => {
    localStorage.removeItem("refresh_lock");
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

        const csrfToken = isRefreshRequest ? getCsrfRefresh() : getCsrfAccess();
        if (csrfToken) {
            config.headers = config.headers || {};
            config.headers["X-CSRF-TOKEN"] = csrfToken;
        }

        return config;
    },
    (error) => Promise.reject(error)
);


api.interceptors.response.use(
    (response) => {
        // Automatically save CSRF tokens returned from login or refresh endpoints
        if (response.data?.csrfAccessToken || response.data?.csrfRefreshToken) {
            setCsrfTokens({
                access: response.data.csrfAccessToken,
                refresh: response.data.csrfRefreshToken,
            });
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        // HANDLE NETWORK LOSS / SERVER UNREACHABLE (NO RESPONSE)
        if (!error.response) {
            originalRequest._networkRetryCount = originalRequest._networkRetryCount || 0;

            // retry up to 3 times on lost connection before failing
            if (originalRequest._networkRetryCount < 3) {
                originalRequest._networkRetryCount += 1;
                const waitTime = originalRequest._networkRetryCount * 1500; // wait 1.5s, 3s, 4.5s

                await delay(waitTime);
                return api(originalRequest);
            }

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
            await softLogout(`CSRF Failure: ${errorCode}`);
            return Promise.reject(error);
        }

        // if token was explicitly revoked (e.g. password reset), force logout without attempting refresh
        if (errorCode === "token_revoked") {
            await softLogout("Token Revoked");
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

            const gotLock = await acquireRefreshLock();
            if (!gotLock) {
                // another tab refreshed while waiting; retry original request directly
                isRefreshing = false;
                await delay(1500);
                return api(originalRequest);
            }

            try {
                // the request interceptor reads csrf_refresh_token and sends X-CSRF-TOKEN
                await api.post("/auth/refresh");
                processQueue(null);

                // retry the original request (now with the fresh access cookie)
                return await api(originalRequest);
            } catch (refreshError) {
                // if refresh cookie expired or is invalid
                processQueue(refreshError, null);
                await softLogout("Refresh request failed");
                return Promise.reject(refreshError);
            } finally {
                releaseRefreshLock();
                isRefreshing = false;
            }
        }

        // if the retried request failed again (invalid session, stale claims)
        if (error.response?.status === 401 && originalRequest._retry) {
            await softLogout("Retry failed with 401");
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default api;