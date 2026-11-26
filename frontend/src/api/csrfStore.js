// storage keys
const CSRF_ACCESS_KEY = "csrf_access";
const CSRF_REFRESH_KEY = "csrf_refresh";
const CSRF_SYNC_EVENT_KEY = "csrf_sync_event";

const CSRF_ACCESS_COOKIE = "csrf_access_token";
const CSRF_REFRESH_COOKIE = "csrf_refresh_token";

const getCookieValue = (name) => {
    if (typeof document === "undefined" || !document.cookie) {
        return null;
    }

    const parts = document.cookie.split("; ");
    for (const part of parts) {
        const eqIndex = part.indexOf("=");
        if (eqIndex === -1) continue;
        const key = part.slice(0, eqIndex);
        if (key === name) {
            return decodeURIComponent(part.slice(eqIndex + 1));
        }
    }
    return null;
};

const readTokensFromStorageAndCookies = () => {
    let storageAccess = sessionStorage.getItem(CSRF_ACCESS_KEY) || null;
    let storageRefresh = sessionStorage.getItem(CSRF_REFRESH_KEY) || null;

    try {
        const rawSync = localStorage.getItem(CSRF_SYNC_EVENT_KEY);
        if (rawSync) {
            const parsed = JSON.parse(rawSync);
            if (parsed.access) {
                storageAccess = parsed.access;
            }
            if (parsed.refresh) {
                storageRefresh = parsed.refresh;
            }
        }
    } catch (e) {
        console.log("Failed to read CSRF sync payload from localStorage:", e);
    }

    // prefer active cookies when accessible, otherwise fall back to storage
    const cookieAccess = getCookieValue(CSRF_ACCESS_COOKIE);
    const cookieRefresh = getCookieValue(CSRF_REFRESH_COOKIE);

    return {
        access: cookieAccess || storageAccess || null,
        refresh: cookieRefresh || storageRefresh || null,
    };
};

const syncStorageWithTokens = (access, refresh) => {
    if (access) {
        sessionStorage.setItem(CSRF_ACCESS_KEY, access);
    } else {
        sessionStorage.removeItem(CSRF_ACCESS_KEY);
    }

    if (refresh) {
        sessionStorage.setItem(CSRF_REFRESH_KEY, refresh);
    } else {
        sessionStorage.removeItem(CSRF_REFRESH_KEY);
    }
};

const initialTokens = readTokensFromStorageAndCookies();
let csrfAccess = initialTokens.access;
let csrfRefresh = initialTokens.refresh;
syncStorageWithTokens(csrfAccess, csrfRefresh);

export const getCsrfAccess = () => csrfAccess;
export const getCsrfRefresh = () => csrfRefresh;

export const rehydrateCsrfFromStorage = () => {
    try {
        const { access, refresh } = readTokensFromStorageAndCookies();

        csrfAccess = access;
        csrfRefresh = refresh;
        syncStorageWithTokens(csrfAccess, csrfRefresh);
    } catch (e) {
        console.log("Failed to rehydrate CSRF tokens:", e);
    }

    return { access: csrfAccess, refresh: csrfRefresh };
};

export const setCsrfTokens = ({ access, refresh }, syncToOtherTabs = true) => {
    if (access) {
        csrfAccess = access;
    }
    if (refresh) {
        csrfRefresh = refresh;
    }

    syncStorageWithTokens(csrfAccess, csrfRefresh);

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