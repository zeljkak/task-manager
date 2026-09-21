// storage keys
const CSRF_ACCESS_KEY = "csrf_access";
const CSRF_REFRESH_KEY = "csrf_refresh";
const CSRF_SYNC_EVENT_KEY = "csrf_sync_event";

// initial hydration attempt: prefer sessionStorage, fallback to localStorage
let csrfAccess = sessionStorage.getItem(CSRF_ACCESS_KEY) || null;
let csrfRefresh = sessionStorage.getItem(CSRF_REFRESH_KEY) || null;

if (!csrfAccess || !csrfRefresh) {
    try {
        const rawSync = localStorage.getItem(CSRF_SYNC_EVENT_KEY);
        if (rawSync) {
            const parsed = JSON.parse(rawSync);
            if (parsed.access) {
                csrfAccess = parsed.access;
                sessionStorage.setItem(CSRF_ACCESS_KEY, parsed.access);
            }
            if (parsed.refresh) {
                csrfRefresh = parsed.refresh;
                sessionStorage.setItem(CSRF_REFRESH_KEY, parsed.refresh);
            }
        }
    } catch (e) {
        console.log("Failed to hydrate CSRF tokens from localStorage:", e);
    }
}

export const getCsrfAccess = () => csrfAccess;
export const getCsrfRefresh = () => csrfRefresh;

export const setCsrfTokens = ({ access, refresh }, syncToOtherTabs = true) => {
    if (access) {
        csrfAccess = access;
        sessionStorage.setItem(CSRF_ACCESS_KEY, access);
    }
    if (refresh) {
        csrfRefresh = refresh;
        sessionStorage.setItem(CSRF_REFRESH_KEY, refresh);
    }

    if (syncToOtherTabs) {
        const payload = {
            access: csrfAccess,
            refresh: csrfRefresh,
            timestamp: Date.now(),
        };
        localStorage.setItem(CSRF_SYNC_EVENT_KEY, JSON.stringify(payload));
    }
};

export const clearCsrfTokens = (syncToOtherTabs = true) => {
    csrfAccess = null;
    csrfRefresh = null;

    sessionStorage.removeItem(CSRF_ACCESS_KEY);
    sessionStorage.removeItem(CSRF_REFRESH_KEY);

    if (syncToOtherTabs) {
        const payload = {
            access: null,
            refresh: null,
            timestamp: Date.now(),
        };
        localStorage.setItem(CSRF_SYNC_EVENT_KEY, JSON.stringify(payload));
    }
};

// multi-tab listener for tabs active during token changes
window.addEventListener("storage", (event) => {
    if (event.key === CSRF_SYNC_EVENT_KEY && event.newValue) {
        try {
            const data = JSON.parse(event.newValue);
            if (data.access || data.refresh) {
                setCsrfTokens({ access: data.access, refresh: data.refresh }, false);
            } else {
                clearCsrfTokens(false);
            }
        } catch (e) {
            console.log("Failed to parse CSRF sync payload:", e);
        }
    }
});