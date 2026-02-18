import { writable, get } from "svelte/store";
import { replace } from "svelte-spa-router";
import type { IAuthContext, AuthAuthenticate, AuthSignup } from "@/lib/types";
import { login, signup, logout, refreshtoken } from "@/lib/api";
import APPLICATION_CONSTANTS from "@/lib/constants";
import { notificationStore } from "./notification";

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

  const showNotification = (msg: string) => {
    notificationStore.ShowNotification({
      notification: { n_status: "error", title: "Error!", message: msg },
    });
  };

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

  const getRefreshToken = async (): Promise<AuthAuthenticate> => {
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

  const autoLogout = () => {
    clearInterval(interval);
    replace(AC.LOGIN_PAGE);
  };

  const logoutHandler = async (token: string) => {
    if (token) {
      try {
        const response = await logout(token);
        if (response && "error" in response) {
          showNotification(response.error ?? AC.GENERAL_ERROR);
          return;
        }
        if (response && "success" in response && response.success) {
          resetAuthContext();
          replace(AC.LOGIN_PAGE);
        }
      } catch (err) {
        showNotification(`${err}`);
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
      const response = await login(email, password);
      if (!response) return undefined;
      if (response && "error" in response) {
        showNotification(response.error ?? AC.GENERAL_ERROR);
        return response;
      }
      if (response && "success" in response && response.success) {
        update((ctx) => ({
          ...ctx,
          success: response.success,
          details: response.details,
          token: response.token,
          loading: false,
        }));
        return response;
      }
    } catch (err) {
      showNotification(`${err}`);
    }
    return undefined;
  };

  const handleSignup = async (
    username: string,
    email: string,
    password: string,
    framework: string,
  ): Promise<AuthSignup> => {
    if (!email || !password) return { error: AC.GENERAL_ERROR };
    try {
      const response = await signup(username, email, password, framework);
      if (!response) return { error: AC.GENERAL_ERROR };
      if (response && "error" in response) {
        const errMsg = response.error ?? AC.GENERAL_ERROR;
        showNotification(errMsg);
        return { error: errMsg };
      }
      if (response && "success" in response && response.success) {
        update((ctx) => ({
          ...ctx,
          success: response.success,
          details: response.details,
          token: response.token,
          loading: false,
        }));
        return response as AuthSignup;
      }
    } catch (err) {
      showNotification(`${err}`);
      return { error: `${err}` };
    }
    return { error: AC.GENERAL_ERROR };
  };

  const authGuardVerify = (): boolean => {
    const ctx = get({ subscribe });
    return !isTokenExpired(ctx.token);
  };

  const getAuth = async () => {
    const ctx = get({ subscribe });
    if (!ctx.token) await verifyRefreshToken();
  };

  const autoRefreshToken = () => {
    interval = setInterval(() => {
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

  return {
    subscribe,
    set,
    update,
    authGuardVerify,
    getAuth,
    verifyRefreshToken,
  };
}

export const authStore = createAuthStore();
