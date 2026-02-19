import { push, replace } from "svelte-spa-router";
import { wrap } from "svelte-spa-router/wrap";
import type { RoutePrecondition } from "svelte-spa-router";
import { authStore } from "@/stores/auth";
import APPLICATION_CONSTANTS from "@/lib/constants";
import type { ComponentType } from "svelte";

const AC = APPLICATION_CONSTANTS;

function asyncRoute<T>(importFn: () => Promise<{ default: T }>) {
  return importFn as () => Promise<{ default: ComponentType }>;
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
    asyncComponent: asyncRoute(() => import("@/routes/Redirect.svelte")),
    conditions: [authGuard],
  }),
  "/login": wrap({
    asyncComponent: asyncRoute(() => import("@/routes/LoginPage.svelte")),
  }),
  "/profile": wrap({
    asyncComponent: asyncRoute(() => import("@/routes/ProfilePage.svelte")),
    conditions: [authGuard],
  }),
  "/notebooks": wrap({
    asyncComponent: asyncRoute(() => import("@/routes/NotebooksPage.svelte")),
    conditions: [authGuard],
  }),
  "/notebook/:notebookId": wrap({
    asyncComponent: asyncRoute(() => import("@/routes/NotebookPage.svelte")),
    conditions: [authGuard],
  }),
  "/notebook/:notebookId/:noteId": wrap({
    asyncComponent: asyncRoute(() => import("@/routes/NotePage.svelte")),
    conditions: [authGuard],
  }),
  "*": wrap({
    asyncComponent: asyncRoute(() => import("@/routes/NotFoundPage.svelte")),
  }),
};

// export const routes = {
//   "/": wrap({
//     asyncComponent: () => import("@/routes/Redirect.svelte"),
//     conditions: [authGuard],
//   }),
//   "/login": wrap({
//     asyncComponent: () => import("@/routes/LoginPage.svelte"),
//   }),
//   "/profile": wrap({
//     asyncComponent: () => import("@/routes/ProfilePage.svelte"),
//     conditions: [authGuard],
//   }),
//   "/notebooks": wrap({
//     asyncComponent: () => import("@/routes/NotebooksPage.svelte"),
//     conditions: [authGuard],
//   }),
//   "/notebook/:notebookId": wrap({
//     component: NotebookPage,
//     conditions: [authGuard],
//   }),
//   "/notebook/:notebookId/:noteId": wrap({
//     asyncComponent: () => import("@/routes/NotePage.svelte"),
//     conditions: [authGuard],
//   }),
//   "*": wrap({
//     asyncComponent: () => import("@/routes/NotFoundPage.svelte"),
//   }),
// };
