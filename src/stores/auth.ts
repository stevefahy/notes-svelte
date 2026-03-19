import { writable, get } from "svelte/store";
import { replace } from "@/lib/router";
import type {
  IAuthContext,
  IAuthDetails,
  AuthAuthenticate,
  AuthSignup,
} from "@/lib/types";
import { login, signup, logout, refreshtoken, unwrapResponse } from "@/lib/api";
import { normalizeErrorToString } from "@/lib/errorMessageMap";
import APPLICATION_CONSTANTS from "@/lib/constants";
import { showErrorSnack } from "./snack";

const AC = APPLICATION_CONSTANTS;

function createAuthStore() {
  const { subscribe, set, update } = writable<IAuthContext>({
    loading: true,
    success: null,
    token: null,
    details: null,
    onLogin: async () => undefined,
    onRegister: async () => undefined,
    onLogout: () => {},
    notebookID: null,
    noteID: null,
  });

  let interval: ReturnType<typeof setInterval>;

  const resetAuthContext = () => {
    update((ctx) => ({
      ...ctx,
      success: null,
      token: null,
      details: null,
      loading: false,
    }));
  };

  const isTokenExpired = (token: string | null): boolean => {
    if (!token || token.length <= 0) return true;
    try {
      const decode = JSON.parse(atob(token.split(".")[1]));
      return decode.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  let refreshInProgress: Promise<AuthAuthenticate | undefined> | null = null;

  const getRefreshToken = async (): Promise<AuthAuthenticate> => {
    if (refreshInProgress) return refreshInProgress;
    const promise = (async () => {
      try {
        const response = await refreshtoken();
        if (!response) return undefined;
        if (response && "error" in response) return response;
        if (response && "success" in response && response.success)
          return response;
      } catch {
        // silent
      }
      return undefined;
    })();
    refreshInProgress = promise;
    try {
      return await promise;
    } finally {
      refreshInProgress = null;
    }
  };

  const verifyRefreshToken = async () => {
    try {
      const response = await getRefreshToken();
      if (!response) {
        resetAuthContext();
        autoLogout();
        return;
      }
      if (response && "success" in response && response.success) {
        update((ctx) => ({
          ...ctx,
          success: response.success,
          details: response.details,
          token: response.token,
          loading: false,
        }));
      } else {
        resetAuthContext();
        autoLogout();
      }
    } catch {
      resetAuthContext();
      autoLogout();
    }
  };

  const verifyRefreshTokenWithRetry = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await getRefreshToken();
        if (response && "success" in response && response.success) {
          update((ctx) => ({
            ...ctx,
            success: response.success,
            details: response.details,
            token: response.token,
            loading: false,
          }));
          return;
        }
      } catch {
        /* retry on next iteration */
      }
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    resetAuthContext();
    autoLogout();
  };

  const autoLogout = () => {
    clearInterval(interval);
    replace(AC.LOGIN_PAGE);
  };

  const logoutHandler = async (token: string) => {
    if (token) {
      try {
        const result = unwrapResponse(await logout(token));
        if (!result.ok) {
          showErrorSnack(result.error ?? AC.GENERAL_ERROR, {
            fromServer: result.fromServer,
          });
          return;
        }
        resetAuthContext();
        replace(AC.LOGIN_PAGE);
      } catch (err) {
        showErrorSnack(normalizeErrorToString(err, AC.GENERAL_ERROR), {
          fromServer: false,
        });
      }
    }
  };

  const handleLogout = async () => {
    const context = await getRefreshToken();
    if (
      context &&
      typeof context === "object" &&
      "token" in context &&
      context.token
    ) {
      await logoutHandler(context.token);
    } else {
      // No valid token - still clear local auth state and navigate away
      resetAuthContext();
      replace(AC.LOGIN_PAGE);
    }
  };

  const handleLogin = async (
    email: string,
    password: string,
  ): Promise<AuthAuthenticate> => {
    if (!email || !password) return undefined;
    try {
      const result = unwrapResponse(await login(email, password));
      if (!result.ok) {
        return { error: result.error, fromServer: result.fromServer };
      }
      const data = result.data as {
        success: boolean;
        token: string;
        details: IAuthDetails;
      };
      update((ctx) => ({
        ...ctx,
        success: data.success,
        details: data.details,
        token: data.token,
        loading: false,
      }));
      return data as AuthAuthenticate;
    } catch (err) {
      return {
        error: normalizeErrorToString(err, AC.GENERAL_ERROR),
        fromServer: false,
      };
    }
  };

  const handleSignup = async (
    username: string,
    email: string,
    password: string,
    framework: string,
  ): Promise<AuthSignup> => {
    if (!email || !password) return { error: AC.GENERAL_ERROR };
    try {
      const result = unwrapResponse(
        await signup(username, email, password, framework),
      );
      if (!result.ok) {
        const errMsg = result.error ?? AC.GENERAL_ERROR;
        return { error: errMsg, fromServer: result.fromServer };
      }
      const data = result.data as {
        success: boolean;
        token: string;
        details: IAuthDetails;
      };
      update((ctx) => ({
        ...ctx,
        success: data.success,
        details: data.details,
        token: data.token,
        loading: false,
      }));
      return data as AuthSignup;
    } catch (err) {
      return {
        error: normalizeErrorToString(err, AC.GENERAL_ERROR),
        fromServer: false,
      };
    }
  };

  const authGuardVerify = (): boolean => {
    const ctx = get({ subscribe });
    return !isTokenExpired(ctx.token);
  };

  const getAuth = async () => {
    const ctx = get({ subscribe });
    if (!ctx.token) await verifyRefreshTokenWithRetry();
  };

  const autoRefreshToken = () => {
    interval = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      const ctx = get({ subscribe });
      if (!ctx.success) autoLogout();
      else verifyRefreshToken();
    }, AC.REFRESH_TOKEN_INTERVAL);
  };

  // Initialize
  update((ctx) => ({
    ...ctx,
    onLogin: handleLogin,
    onRegister: handleSignup,
    onLogout: handleLogout,
  }));

  autoRefreshToken();

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        setTimeout(() => verifyRefreshTokenWithRetry(), 500);
      }
    });
  }

  return {
    subscribe,
    set,
    update,
    authGuardVerify,
    getAuth,
    verifyRefreshToken,
    verifyRefreshTokenWithRetry,
  };
}

export const authStore = createAuthStore();
