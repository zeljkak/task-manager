import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";

const APP_URL = import.meta.env.VITE_APP_URL || "http://localhost:5173/";

const mockGetCsrfAccess = vi.fn();
const mockGetCsrfRefresh = vi.fn();
const mockSetCsrfTokens = vi.fn();
const mockClearCsrfTokens = vi.fn();
const mockRehydrateCsrfFromStorage = vi.fn();

// keep a reference to the underlying adapter so we can control responses per test
let mockAdapter;
let axiosPostSpy;
let storageStore;

async function loadApiModule() {
  vi.resetModules();

  vi.doMock("../api/csrfStore.js", () => ({
    getCsrfAccess: mockGetCsrfAccess,
    getCsrfRefresh: mockGetCsrfRefresh,
    setCsrfTokens: mockSetCsrfTokens,
    clearCsrfTokens: mockClearCsrfTokens,
    rehydrateCsrfFromStorage: mockRehydrateCsrfFromStorage,
  }));

  const mod = await import("../api/axios.js");
  mod.default.defaults.adapter = mockAdapter;
  return mod;
}

function createHttpError(message, status, data = {}, config = undefined) {
  const err = new Error(message);
  err.response = { status, data };
  if (config) {
    err.config = config;
  }
  return err;
}

describe("axios client and interceptors", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    storageStore = {};
    vi.spyOn(localStorage, "getItem").mockImplementation(
      (key) => (key in storageStore ? storageStore[key] : null)
    );
    vi.spyOn(localStorage, "setItem").mockImplementation((key, value) => {
      storageStore[key] = String(value);
    });
    vi.spyOn(localStorage, "removeItem").mockImplementation((key) => {
      delete storageStore[key];
    });
    vi.spyOn(localStorage, "clear").mockImplementation(() => {
      storageStore = {};
    });

    // default ok adapter
    mockAdapter = vi.fn(async (config) => ({
      data: { ok: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    }));

    axiosPostSpy = vi.spyOn(axios, "post").mockResolvedValue({ data: {} });

    // location object so setting window.location.href = "/login?..." does not throw
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        pathname: "/",
        href: APP_URL,
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    axiosPostSpy.mockRestore();
    vi.restoreAllMocks();
  });

  describe("request interceptor - CSRF headers", () => {
    it("attaches X-CSRF-TOKEN access token on state-changing requests", async () => {
      mockGetCsrfAccess.mockReturnValue("access-csrf-123");
      const { default: api } = await loadApiModule();

      for (const method of ["post", "put", "patch", "delete"]) {
        await api({ method, url: "/tasks", data: { title: "Test" } });
      }

      expect(mockAdapter).toHaveBeenCalledTimes(4);
      for (const call of mockAdapter.mock.calls) {
        expect(call[0].headers["X-CSRF-TOKEN"]).toBe("access-csrf-123");
      }
    });

    it("does not attach X-CSRF-TOKEN on GET requests", async () => {
      mockGetCsrfAccess.mockReturnValue("access-csrf-123");
      const { default: api } = await loadApiModule();

      await api.get("/tasks");

      expect(mockAdapter.mock.calls[0][0].headers?.["X-CSRF-TOKEN"]).toBeUndefined();
    });

    it.each([
      "/auth/login",
      "/auth/register",
      "/auth/logout",
      "/auth/request-email-verification",
      "/auth/verify-email/abc",
      "/auth/forgot-password",
      "/auth/reset-password/xyz",
      "/users/restore-request",
      "/users/restore/123",
    ])("skips CSRF header on non-refresh auth route %s", async (route) => {
      mockGetCsrfAccess.mockReturnValue("access-csrf-123");
      const { default: api } = await loadApiModule();

      await api.post(route, { email: "a@b.com" });

      expect(mockAdapter.mock.calls[0][0].headers?.["X-CSRF-TOKEN"]).toBeUndefined();
    });

    it("attaches refresh CSRF token on /auth/refresh", async () => {
      mockGetCsrfRefresh.mockReturnValue("refresh-csrf-456");
      const { default: api } = await loadApiModule();

      await api.post("/auth/refresh");

      expect(mockAdapter.mock.calls[0][0].headers["X-CSRF-TOKEN"]).toBe("refresh-csrf-456");
    });

    it("does not attach X-CSRF-TOKEN when access or refresh CSRF token is missing", async () => {
      mockGetCsrfAccess.mockReturnValue(null);
      mockGetCsrfRefresh.mockReturnValue(undefined);
      const { default: api } = await loadApiModule();

      await api.post("/tasks", { title: "No token" });
      await api.post("/auth/refresh");

      expect(mockAdapter.mock.calls[0][0].headers?.["X-CSRF-TOKEN"]).toBeUndefined();
      expect(mockAdapter.mock.calls[1][0].headers?.["X-CSRF-TOKEN"]).toBeUndefined();
    });
  });

  describe("response interceptor - token persistence", () => {
    it("saves CSRF tokens when returned in response data", async () => {
      mockAdapter.mockResolvedValueOnce({
        data: {
          csrfAccessToken: "new-access",
          csrfRefreshToken: "new-refresh",
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: { url: "/auth/login", method: "post" },
      });

      const { default: api } = await loadApiModule();
      await api.post("/auth/login");

      expect(mockSetCsrfTokens).toHaveBeenCalledWith({
        access: "new-access",
        refresh: "new-refresh",
      });
    });

    it("saves partial CSRF tokens when only access or refresh token is returned", async () => {
      mockAdapter.mockResolvedValueOnce({
        data: { csrfAccessToken: "only-access" },
        status: 200,
        statusText: "OK",
        headers: {},
        config: { url: "/auth/refresh", method: "post" },
      });

      const { default: api } = await loadApiModule();
      await api.post("/auth/refresh");

      expect(mockSetCsrfTokens).toHaveBeenCalledWith({
        access: "only-access",
        refresh: undefined,
      });
    });

    it("does not call setCsrfTokens when response data contains no CSRF tokens", async () => {
      mockAdapter.mockResolvedValueOnce({
        data: { items: [] },
        status: 200,
        statusText: "OK",
        headers: {},
        config: { url: "/tasks", method: "get" },
      });

      const { default: api } = await loadApiModule();
      await api.get("/tasks");

      expect(mockSetCsrfTokens).not.toHaveBeenCalled();
    });
  });

  describe("response interceptor - general errors and network retries", () => {
    it("rejects immediately when error has no config", async () => {
      mockAdapter.mockImplementationOnce(async () => {
        throw new Error("Configless error");
      });

      const { default: api } = await loadApiModule();
      await expect(api.get("/tasks")).rejects.toThrow("Configless error");
      expect(mockClearCsrfTokens).not.toHaveBeenCalled();
    });

    it.each([400, 403, 404, 500])(
      "rejects non-401 HTTP %i errors without refreshing or logging out",
      async (status) => {
        mockAdapter.mockImplementationOnce(async (config) => {
          throw createHttpError(`HTTP ${status}`, status, { error: "some_error" }, config);
        });

        const { default: api } = await loadApiModule();
        await expect(api.get("/tasks")).rejects.toThrow(`HTTP ${status}`);

        expect(mockAdapter).toHaveBeenCalledTimes(1);
        expect(mockClearCsrfTokens).not.toHaveBeenCalled();
      }
    );

    it("retries up to 3 times on network error before succeeding", async () => {
      vi.useFakeTimers();
      let attempts = 0;

      mockAdapter.mockImplementation(async (config) => {
        attempts += 1;
        if (attempts <= 3) {
          const err = new Error("Network Error");
          err.config = config;
          throw err;
        }
        return { data: { recovered: true }, status: 200, statusText: "OK", headers: {}, config };
      });

      const { default: api } = await loadApiModule();
      const promise = api.get("/tasks");

      // advance past 1.5s, 3.0s, and 4.5s backoff timers
      await vi.advanceTimersByTimeAsync(1500 + 3000 + 4500);

      const res = await promise;
      expect(res.data).toEqual({ recovered: true });
      expect(attempts).toBe(4);
    });

    it("rejects after exhausting 3 network retries", async () => {
      vi.useFakeTimers();

      mockAdapter.mockImplementation(async (config) => {
        const err = new Error("Network Down");
        err.config = config;
        throw err;
      });

      const { default: api } = await loadApiModule();
      const promise = api.get("/tasks");
      const assertion = expect(promise).rejects.toThrow("Network Down");

      await vi.advanceTimersByTimeAsync(1500 + 3000 + 4500);
      await assertion;
      expect(mockAdapter).toHaveBeenCalledTimes(4);
    });
  });

  describe("response interceptor - 401 refresh and queuing", () => {
    it("refreshes token on 401 and retries original request", async () => {
      let tasksCalls = 0;
      const dispatchSpy = vi.spyOn(window, "dispatchEvent");

      mockAdapter.mockImplementation(async (config) => {
        if (config.url === "/auth/refresh") {
          return { data: { csrfAccessToken: "refreshed-access" }, status: 200, statusText: "OK", headers: {}, config };
        }
        if (config.url === "/tasks") {
          tasksCalls += 1;
          if (tasksCalls === 1) {
            throw createHttpError("Unauthorized", 401, {}, config);
          }
          return { data: [{ id: 1 }], status: 200, statusText: "OK", headers: {}, config };
        }
        return { data: {}, status: 200, statusText: "OK", headers: {}, config };
      });

      const { default: api } = await loadApiModule();
      const res = await api.get("/tasks");

      expect(res.data).toEqual([{ id: 1 }]);
      expect(tasksCalls).toBe(2);
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it("queues concurrent 401 requests behind a single refresh call", async () => {
      let refreshCount = 0;
      let endpointACalls = 0;
      let endpointBCalls = 0;
      let resolveRefresh;

      mockAdapter.mockImplementation(async (config) => {
        if (config.url === "/auth/refresh") {
          refreshCount += 1;
          return new Promise((resolve) => {
            resolveRefresh = () =>
              resolve({ data: {}, status: 200, statusText: "OK", headers: {}, config });
          });
        }
        if (config.url === "/a") {
          endpointACalls += 1;
          if (endpointACalls === 1) {
            throw createHttpError("401", 401, {}, config);
          }
          return { data: "A-ok", status: 200, statusText: "OK", headers: {}, config };
        }
        if (config.url === "/b") {
          endpointBCalls += 1;
          if (endpointBCalls === 1) {
            throw createHttpError("401", 401, {}, config);
          }
          return { data: "B-ok", status: 200, statusText: "OK", headers: {}, config };
        }
        return { data: {}, status: 200, statusText: "OK", headers: {}, config };
      });

      const { default: api } = await loadApiModule();
      const promiseA = api.get("/a");
      const promiseB = api.get("/b");

      await vi.waitFor(() => {
        expect(resolveRefresh).toBeTypeOf("function");
      });
      resolveRefresh();

      const [resA, resB] = await Promise.all([promiseA, promiseB]);

      expect(resA.data).toBe("A-ok");
      expect(resB.data).toBe("B-ok");
      expect(refreshCount).toBe(1);
    });

    it("rejects queued 401 requests and triggers soft logout once when refresh fails", async () => {
      let refreshCount = 0;
      let rejectRefresh;

      mockAdapter.mockImplementation(async (config) => {
        if (config.url === "/auth/refresh") {
          refreshCount += 1;
          return new Promise((_, reject) => {
            rejectRefresh = () => reject(createHttpError("Refresh expired", 401, {}, config));
          });
        }
        throw createHttpError("Unauthorized", 401, {}, config);
      });

      const { default: api } = await loadApiModule();
      const promiseA = api.get("/a");
      const promiseB = api.get("/b");

      await vi.waitFor(() => {
        expect(rejectRefresh).toBeTypeOf("function");
      });
      rejectRefresh();

      const results = await Promise.allSettled([promiseA, promiseB]);

      expect(results[0].status).toBe("rejected");
      expect(results[1].status).toBe("rejected");
      expect(refreshCount).toBe(1);
      expect(mockClearCsrfTokens).toHaveBeenCalledTimes(1);
      expect(axiosPostSpy).toHaveBeenCalledTimes(1);
    });

    it("triggers soft logout when /auth/refresh fails during 401 recovery", async () => {
      const dispatchSpy = vi.spyOn(window, "dispatchEvent");

      mockAdapter.mockImplementation(async (config) => {
        if (config.url === "/auth/refresh") {
          throw createHttpError("Refresh expired", 401, {}, config);
        }
        throw createHttpError("Unauthorized", 401, {}, config);
      });

      const { default: api } = await loadApiModule();
      await expect(api.get("/tasks")).rejects.toThrow("Refresh expired");

      expect(mockClearCsrfTokens).toHaveBeenCalledTimes(1);
      expect(axiosPostSpy).toHaveBeenCalledWith(
        expect.stringContaining("/auth/clear-cookies"),
        {},
        { withCredentials: true }
      );
      expect(localStorage.getItem("app_logout_event")).toBeTruthy();
      expect(window.location.href).toBe("/login?forcedLogout=true");
      expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
    });

    it("rejects direct /auth/refresh failure without looping or calling softLogout", async () => {
      mockAdapter.mockImplementationOnce(async (config) => {
        throw createHttpError("Refresh invalid", 401, {}, config);
      });

      const { default: api } = await loadApiModule();
      await expect(api.post("/auth/refresh")).rejects.toThrow("Refresh invalid");

      expect(mockAdapter).toHaveBeenCalledTimes(1);
      expect(mockClearCsrfTokens).not.toHaveBeenCalled();
      expect(axiosPostSpy).not.toHaveBeenCalled();
    });

    it("soft logs out when retried request still returns 401", async () => {
      let tasksCalls = 0;
      let refreshCalls = 0;

      mockAdapter.mockImplementation(async (config) => {
        if (config.url === "/auth/refresh") {
          refreshCalls += 1;
          return { data: {}, status: 200, statusText: "OK", headers: {}, config };
        }
        if (config.url === "/tasks") {
          tasksCalls += 1;
          throw createHttpError("Still unauthorized", 401, {}, config);
        }
        return { data: {}, status: 200, statusText: "OK", headers: {}, config };
      });

      const { default: api } = await loadApiModule();
      await expect(api.get("/tasks")).rejects.toThrow("Still unauthorized");

      expect(tasksCalls).toBe(2);
      expect(refreshCalls).toBe(1);
      expect(mockClearCsrfTokens).toHaveBeenCalledTimes(1);
      expect(window.location.href).toBe("/login?forcedLogout=true");
    });

    it.each([
      "/auth/login",
      "/auth/logout",
      "/auth/forgot-password",
      "/users/restore-request",
    ])("does not refresh or soft logout on 401 for auth route %s", async (route) => {
      let refreshCalled = false;

      mockAdapter.mockImplementation(async (config) => {
        if (config.url === "/auth/refresh") {
          refreshCalled = true;
        }
        throw createHttpError("Auth route unauthorized", 401, {}, config);
      });

      const { default: api } = await loadApiModule();
      await expect(api.post(route, { email: "a@b.com" })).rejects.toThrow(
        "Auth route unauthorized"
      );

      expect(refreshCalled).toBe(false);
      expect(mockClearCsrfTokens).not.toHaveBeenCalled();
    });

    it("skips refresh when originalRequest.skipRefresh is true", async () => {
      let refreshCalled = false;

      mockAdapter.mockImplementation(async (config) => {
        if (config.url === "/auth/refresh") {
          refreshCalled = true;
        }
        throw createHttpError("Unauthorized", 401, {}, config);
      });

      const { default: api } = await loadApiModule();
      await expect(api.get("/profile", { skipRefresh: true })).rejects.toThrow("Unauthorized");
      expect(refreshCalled).toBe(false);
    });
  });

  describe("response interceptor - CSRF and token_revoked errors", () => {
    it.each(["csrf_missing", "csrf_invalid", "token_revoked"])(
      "soft logs out immediately on error code %s",
      async (errorCode) => {
        mockAdapter.mockImplementation(async (config) => {
          throw createHttpError(errorCode, 401, { error: errorCode }, config);
        });

        const { default: api } = await loadApiModule();
        await expect(api.get("/tasks")).rejects.toThrow(errorCode);

        expect(mockClearCsrfTokens).toHaveBeenCalledTimes(1);
        expect(localStorage.getItem("app_logout_event")).toBeTruthy();
      }
    );

    it("completes soft logout even when /auth/clear-cookies fails", async () => {
      axiosPostSpy.mockRejectedValueOnce(new Error("Clear cookies failed"));
      mockAdapter.mockImplementation(async (config) => {
        throw createHttpError("token_revoked", 401, { error: "token_revoked" }, config);
      });

      const { default: api } = await loadApiModule();
      await expect(api.get("/tasks")).rejects.toThrow("token_revoked");

      expect(mockClearCsrfTokens).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem("app_logout_event")).toBeTruthy();
      expect(window.location.href).toBe("/login?forcedLogout=true");
    });

    it("does not overwrite window.location.href when already on /login", async () => {
      window.location.pathname = "/login";
      window.location.href = "/login";

      mockAdapter.mockImplementation(async (config) => {
        throw createHttpError("token_revoked", 401, { error: "token_revoked" }, config);
      });

      const { default: api } = await loadApiModule();
      await expect(api.get("/tasks")).rejects.toThrow("token_revoked");

      expect(window.location.href).toBe("/login");
    });

    it("guards against duplicate concurrent softLogout execution", async () => {
      let resolveClearCookies;
      axiosPostSpy.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveClearCookies = resolve;
          })
      );

      mockAdapter.mockImplementation(async (config) => {
        throw createHttpError("token_revoked", 401, { error: "token_revoked" }, config);
      });

      const { default: api } = await loadApiModule();
      const p1 = api.get("/a").catch((e) => e);
      const p2 = api.get("/b").catch((e) => e);

      // wait until softLogout reaches axios.post("/auth/clear-cookies")
      await vi.waitFor(() => {
        expect(resolveClearCookies).toBeTypeOf("function");
      });

      resolveClearCookies({ data: {} });
      await Promise.all([p1, p2]);

      expect(axiosPostSpy).toHaveBeenCalledTimes(1);
      expect(mockClearCsrfTokens).toHaveBeenCalledTimes(1);
    });
  });

  describe("refresh lock and refreshSession", () => {
    it("acquires and releases the refresh lock in localStorage", async () => {
      const { acquireRefreshLock, releaseRefreshLock } = await loadApiModule();

      const acquired = await acquireRefreshLock();
      expect(acquired).toBe(true);
      expect(localStorage.getItem("refresh_lock")).toBeTruthy();

      releaseRefreshLock();
      expect(localStorage.getItem("refresh_lock")).toBeNull();
    });

    it("takes over an expired refresh lock", async () => {
      const now = 1_700_000_000_000;
      vi.spyOn(Date, "now").mockReturnValue(now);
      storageStore["refresh_lock"] = String(now - 6000);

      const { acquireRefreshLock } = await loadApiModule();
      const acquired = await acquireRefreshLock();

      expect(acquired).toBe(true);
      expect(localStorage.getItem("refresh_lock")).toBe(String(now));
    });

    it("returns false when refresh lock stays active past timeout", async () => {
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
      const start = 1_700_000_000_000;
      vi.spyOn(Date, "now").mockReturnValue(start);
      storageStore["refresh_lock"] = String(start);

      const { acquireRefreshLock } = await loadApiModule();
      const promise = acquireRefreshLock();

      await vi.advanceTimersByTimeAsync(50 * 100);
      await expect(promise).resolves.toBe(false);
    });

    it("deduplicates concurrent refreshSession calls", async () => {
      let refreshHits = 0;
      let resolveRefresh;

      mockAdapter.mockImplementation(async (config) => {
        if (config.url === "/auth/refresh") {
          refreshHits += 1;
          return new Promise((resolve) => {
            resolveRefresh = () =>
              resolve({ data: {}, status: 200, statusText: "OK", headers: {}, config });
          });
        }
        return { data: {}, status: 200, statusText: "OK", headers: {}, config };
      });

      const { refreshSession } = await loadApiModule();
      const p1 = refreshSession();
      const p2 = refreshSession();

      await vi.waitFor(() => {
        expect(resolveRefresh).toBeTypeOf("function");
      });
      resolveRefresh();

      const [r1, r2] = await Promise.all([p1, p2]);

      expect(r1).toEqual({ ok: true });
      expect(r2).toEqual({ ok: true });
      expect(refreshHits).toBe(1);
      expect(mockRehydrateCsrfFromStorage).toHaveBeenCalled();
    });

    it("resets refreshPromise so subsequent refreshSession calls execute fresh refreshes", async () => {
      let refreshHits = 0;
      mockAdapter.mockImplementation(async (config) => {
        if (config.url === "/auth/refresh") {
          refreshHits += 1;
          if (refreshHits === 1) {
            throw createHttpError("Temporary failure", 500, {}, config);
          }
          return { data: {}, status: 200, statusText: "OK", headers: {}, config };
        }
        return { data: {}, status: 200, statusText: "OK", headers: {}, config };
      });

      const { refreshSession } = await loadApiModule();

      await expect(refreshSession()).rejects.toThrow("Temporary failure");
      await expect(refreshSession()).resolves.toEqual({ ok: true });
      expect(refreshHits).toBe(2);
    });

    it("shares refresh when another tab holds the refresh lock", async () => {
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
      const start = 1_700_000_000_000;
      vi.spyOn(Date, "now").mockReturnValue(start);
      storageStore["refresh_lock"] = String(start);

      let refreshHits = 0;
      mockAdapter.mockImplementation(async (config) => {
        if (config.url === "/auth/refresh") {
          refreshHits += 1;
        }
        return { data: {}, status: 200, statusText: "OK", headers: {}, config };
      });

      const { refreshSession } = await loadApiModule();
      const promise = refreshSession();

      // advance past 5s lock polling + 1.5s shared wait
      await vi.advanceTimersByTimeAsync(5000 + 1500);

      await expect(promise).resolves.toEqual({ ok: true, shared: true });
      expect(refreshHits).toBe(0);
      expect(mockRehydrateCsrfFromStorage).toHaveBeenCalled();
    });

    it("retries original request after waiting when another tab holds lock on 401", async () => {
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
      const start = 1_700_000_000_000;
      vi.spyOn(Date, "now").mockReturnValue(start);
      storageStore["refresh_lock"] = String(start);

      let refreshHits = 0;
      let tasksCalls = 0;

      mockAdapter.mockImplementation(async (config) => {
        if (config.url === "/auth/refresh") {
          refreshHits += 1;
        }
        if (config.url === "/tasks") {
          tasksCalls += 1;
          if (tasksCalls === 1) {
            throw createHttpError("Unauthorized", 401, {}, config);
          }
          return { data: { retriedAfterLockWait: true }, status: 200, statusText: "OK", headers: {}, config };
        }
        return { data: {}, status: 200, statusText: "OK", headers: {}, config };
      });

      const { default: api } = await loadApiModule();
      const promise = api.get("/tasks");

      // advance past 5s lock polling + 1.5s retry delay
      await vi.advanceTimersByTimeAsync(5000 + 1500);

      const res = await promise;
      expect(res.data).toEqual({ retriedAfterLockWait: true });
      expect(refreshHits).toBe(0);
      expect(tasksCalls).toBe(2);
    });

    it("rejects refreshSession on failure without calling softLogout", async () => {
      mockAdapter.mockImplementation(async (config) => {
        if (config.url === "/auth/refresh") {
          throw createHttpError("Refresh failed", 401, {}, config);
        }
        return { data: {}, status: 200, statusText: "OK", headers: {}, config };
      });

      const { refreshSession } = await loadApiModule();
      await expect(refreshSession()).rejects.toThrow("Refresh failed");

      expect(mockClearCsrfTokens).not.toHaveBeenCalled();
      expect(axiosPostSpy).not.toHaveBeenCalled();
    });
  });
});