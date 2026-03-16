import { push, replace } from "svelte-spa-router";
import { wrap } from "svelte-spa-router/wrap";
import type { RoutePrecondition } from "svelte-spa-router";
import { authStore } from "@/stores/auth";
import APPLICATION_CONSTANTS from "@/lib/constants";
import type { ComponentType } from "svelte";
import RouteLoadError from "@/routes/RouteLoadError.svelte";

const AC = APPLICATION_CONSTANTS;

function asyncRoute<T>(importFn: () => Promise<{ default: T }>) {
  return importFn as () => Promise<{ default: ComponentType }>;
}

function asyncRouteWithFallback<T>(
  importFn: () => Promise<{ default: T }>,
): () => Promise<{ default: ComponentType }> {
  return async () => {
    try {
      return (await importFn()) as { default: ComponentType };
    } catch {
      return { default: RouteLoadError as unknown as ComponentType };
    }
  };
}

const authGuard: RoutePrecondition = (detail) => {
  if (!authStore.authGuardVerify()) {
    const redirect =
      detail.location + (detail.querystring ? "?" + detail.querystring : "");
    replace(`/login?redirect=${encodeURIComponent(redirect)}`);
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
