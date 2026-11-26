import axios from "axios";
import { getCsrfAccess, getCsrfRefresh, setCsrfTokens, clearCsrfTokens, rehydrateCsrfFromStorage} from "./csrfStore.js";

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

// guard flag to prevent multiple concurrent softLogout calls
let isLoggingOut = false;

// soft logout: clears client state and redirects without hitting /auth/logout (avoids revoking valid refresh sessions)
const softLogout = async (reason) => {
    if (isLoggingOut) return;
    isLoggingOut = true;

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

const REFRESH_LOCK_KEY = "refresh_lock";
const LOCK_TIMEOUT_MS = 5000;

// cross-tab lock helper using localStorage
export const acquireRefreshLock = async () => {
    const pollInterval = 100;
    const maxRetries = 50; // aligns 5s polling window with the 5s lock timeout

    for (let i = 0; i < maxRetries; i++) {
        const currentTime = Date.now();
        const lock = localStorage.getItem(REFRESH_LOCK_KEY);

        if (!lock || currentTime - parseInt(lock, 10) > LOCK_TIMEOUT_MS) {
            localStorage.setItem(REFRESH_LOCK_KEY, currentTime.toString());
            return true;
        }
        await delay(pollInterval);
    }
    return false;
};

export const releaseRefreshLock = () => {
    localStorage.removeItem(REFRESH_LOCK_KEY);
};

// shared refresh session helper for AuthContext and WebSocket hook
let refreshPromise = null;

// refresh access and refresh cookies exactly once across concurrent callers
// doesn't soft-logout on failure — callers decide
export const refreshSession = () => {
    rehydrateCsrfFromStorage();
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            });
        }

        isRefreshing = true;
        const gotLock = await acquireRefreshLock();
        // if another tab is refreshing
        // wait for cookies + CSRF sync, do not rotate again
        if (!gotLock) {
            isRefreshing = false;
            await delay(1500);
            rehydrateCsrfFromStorage();
            return { ok: true, shared: true };
        }

        try {
            const { refresh } = rehydrateCsrfFromStorage();
            if (!refresh) {
                const err = new Error("Missing refresh CSRF token");
                err.code = "MISSING_REFRESH_CSRF";
                throw err;
            }

            await api.post("/auth/refresh");
            processQueue(null);
            rehydrateCsrfFromStorage();
            return { ok: true };
        } catch (err) {
            processQueue(err, null);
            throw err;
        } finally {
            releaseRefreshLock();
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};

const runTokenRefresh = async (originalRequest) => {
    rehydrateCsrfFromStorage();

    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const gotLock = await acquireRefreshLock();
    if (!gotLock) {
        isRefreshing = false;
        await delay(1500);
        rehydrateCsrfFromStorage();
        return api(originalRequest);
    }

    try {
        const { refresh } = rehydrateCsrfFromStorage();
        if (!refresh) {
            throw new Error("Missing refresh CSRF token");
        }

        await api.post("/auth/refresh");
        processQueue(null);
        rehydrateCsrfFromStorage();
        return await api(originalRequest);
    } catch (refreshError) {
        processQueue(refreshError, null);
        await softLogout("Refresh request failed");
        return Promise.reject(refreshError);
    } finally {
        releaseRefreshLock();
        isRefreshing = false;
    }
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
            config._sentCsrfToken = csrfToken;
        } else if (config.headers) {
            delete config.headers["X-CSRF-TOKEN"];
            config._sentCsrfToken = null;
        }

        return config;
    },
    (error) => Promise.reject(error)
);


api.interceptors.response.use(
    (response) => {
        // automatically save CSRF tokens returned from login or refresh endpoints
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

        const errorCode = error.response?.data?.error;

        // if token was explicitly revoked (e.g. password reset), force logout without attempting refresh
        if (errorCode === "token_revoked") {
            await softLogout("Token Revoked");
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

        // skip refresh if explicitly disabled for this request (in AuthContext.jsx)
        if (originalRequest.skipRefresh === true) {
            return Promise.reject(error);
        }

        const isCsrfError = errorCode === "csrf_missing" || errorCode === "csrf_invalid";

        // CSRF failure
        // first rehydrate CSRF tokens from storage and retry once if a fresh token exists
        if (isCsrfError && !originalRequest._csrfRehydrated) {
            originalRequest._csrfRehydrated = true;
            const { access } = rehydrateCsrfFromStorage();

            if (access && access !== originalRequest._sentCsrfToken) {
                return api(originalRequest);
            }
        }

        // if request failed with 401 (including unresolved CSRF error after rehydration) and hasn't refreshed yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            return runTokenRefresh(originalRequest);
        }

        // last if retry after refresh/rehydration still failed with 401 or CSRF error, log out
        if (error.response?.status === 401 && (originalRequest._retry || isCsrfError)) {
            await softLogout(isCsrfError ? `CSRF Failure after retry: ${errorCode}` : "Retry failed with 401");
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default api;