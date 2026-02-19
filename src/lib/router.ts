import { push, replace } from "svelte-spa-router";
import { wrap } from "svelte-spa-router/wrap";
import type { RoutePrecondition } from "svelte-spa-router";
import { authStore } from "@/stores/auth";
import APPLICATION_CONSTANTS from "@/lib/constants";
import type { ComponentType } from "svelte";

const AC = APPLICATION_CONSTANTS;

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
    asyncComponent: () =>
      import("@/routes/Redirect.svelte") as unknown as Promise<{
        default: ComponentType;
      }>,
    conditions: [authGuard],
  }),
  "/login": wrap({
    asyncComponent: () =>
      import("@/routes/LoginPage.svelte") as unknown as Promise<{
        default: ComponentType;
      }>,
  }),
  "/profile": wrap({
    asyncComponent: () =>
      import("@/routes/ProfilePage.svelte") as unknown as Promise<{
        default: ComponentType;
      }>,
    conditions: [authGuard],
  }),
  "/notebooks": wrap({
    asyncComponent: () =>
      import("@/routes/NotebooksPage.svelte") as unknown as Promise<{
        default: ComponentType;
      }>,
    conditions: [authGuard],
  }),
  "/notebook/:notebookId": wrap({
    asyncComponent: () =>
      import("@/routes/NotebookPage.svelte") as unknown as Promise<{
        default: ComponentType;
      }>,
    conditions: [authGuard],
  }),
  "/notebook/:notebookId/:noteId": wrap({
    asyncComponent: () =>
      import("@/routes/NotePage.svelte") as unknown as Promise<{
        default: ComponentType;
      }>,
    conditions: [authGuard],
  }),
  "*": wrap({
    asyncComponent: () =>
      import("@/routes/NotFoundPage.svelte") as unknown as Promise<{
        default: ComponentType;
      }>,
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
