import { push as spaPush, replace as spaReplace } from "svelte-spa-router";
import { wrap } from "svelte-spa-router/wrap";
import type { RoutePrecondition } from "svelte-spa-router";
import { get, writable } from "svelte/store";
import { authStore } from "@/stores/auth";
import { isJwtExpired } from "@/lib/jwt";
import APPLICATION_CONSTANTS from "@/lib/constants";
import type { Component } from "svelte";
import RouteLoadError from "@/routes/RouteLoadError.svelte";

const AC = APPLICATION_CONSTANTS;

/** Callback registered by NotePage; runs before navigation away from note route. */
export type ConfirmNavigateAwayFn = () => Promise<void>;

export const confirmNavigateAwayStore = writable<ConfirmNavigateAwayFn | null>(
  null,
);

/** Wrapped push that runs confirmNavigateAway before navigating. */
export async function push(path: string): Promise<void> {
  const fn = get(confirmNavigateAwayStore);
  if (fn) await fn();
  return spaPush(path);
}

/** Wrapped replace that runs confirmNavigateAway before navigating. */
export async function replace(path: string): Promise<void> {
  const fn = get(confirmNavigateAwayStore);
  if (fn) await fn();
  return spaReplace(path);
}

function asyncRouteWithFallback(
  importFn: () => Promise<{ default: Component }>,
): () => Promise<{ default: Component }> {
  return async () => {
    try {
      return await importFn();
    } catch {
      return { default: RouteLoadError as unknown as Component };
    }
  };
}

const authGuard: RoutePrecondition = async (detail) => {
  const ctx = get(authStore);
  if (!ctx.token || isJwtExpired(ctx.token)) {
    await authStore.verifyRefreshTokenWithRetry();
  }
  if (!authStore.authGuardVerify()) {
    const redirect =
      detail.location + (detail.querystring ? "?" + detail.querystring : "");
    await replace(`/login?redirect=${encodeURIComponent(redirect)}`);
    return false;
  }
  return true;
};

export const routes = {
  "/": wrap({
    asyncComponent: asyncRouteWithFallback(
      () => import("@/routes/Redirect.svelte"),
    ),
    conditions: [authGuard],
  }),
  "/login": wrap({
    asyncComponent: asyncRouteWithFallback(
      () => import("@/routes/LoginPage.svelte"),
    ),
  }),
  "/profile": wrap({
    asyncComponent: asyncRouteWithFallback(
      () => import("@/routes/ProfilePage.svelte"),
    ),
    conditions: [authGuard],
  }),
  "/notebooks": wrap({
    asyncComponent: asyncRouteWithFallback(
      () => import("@/routes/NotebooksPage.svelte"),
    ),
    conditions: [authGuard],
  }),
  "/notebook/:notebookId": wrap({
    asyncComponent: asyncRouteWithFallback(
      () => import("@/routes/NotebookPage.svelte"),
    ),
    conditions: [authGuard],
  }),
  "/notebook/:notebookId/:noteId": wrap({
    asyncComponent: asyncRouteWithFallback(
      () => import("@/routes/NotePage.svelte"),
    ),
    conditions: [authGuard],
  }),
  "*": wrap({
    asyncComponent: asyncRouteWithFallback(
      () => import("@/routes/NotFoundPage.svelte"),
    ),
  }),
};
