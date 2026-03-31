/**
 * Notebook + note IDs from router params with hash fallback (refresh / timing).
 */
export function notePageNotebookId(
  routeParams: Record<string, string> | null | undefined,
  routerParams: Record<string, string> | null | undefined,
  windowHash: string,
): string | null {
  const fromParams = (routeParams ?? routerParams)?.notebookId;
  if (fromParams) return fromParams;
  const m = /#?\/notebook\/([^/]+)\/([^/]+)/.exec(windowHash);
  return m?.[1] ?? null;
}

export function notePageNoteId(
  routeParams: Record<string, string> | null | undefined,
  routerParams: Record<string, string> | null | undefined,
  windowHash: string,
): string | null {
  const fromParams = (routeParams ?? routerParams)?.noteId;
  if (fromParams) return fromParams;
  const m = /#?\/notebook\/([^/]+)\/([^/]+)/.exec(windowHash);
  return m?.[2] ?? null;
}

/**
 * Single notebook segment for `/notebook/:notebookId` routes.
 */
export function notebookPageNotebookId(
  routeParams: Record<string, string> | null | undefined,
  routerParams: Record<string, string> | null | undefined,
  routerLocation: string | undefined,
  windowHash: string,
): string | null {
  const fromParams = (routeParams ?? routerParams)?.notebookId;
  if (fromParams) return fromParams;
  if (routerLocation) {
    const m = /^\/notebook\/([^/]+)/.exec(routerLocation);
    if (m?.[1]) return m[1];
  }
  const hashMatch = /#?\/notebook\/([^/]+)/.exec(windowHash);
  return hashMatch?.[1] ?? null;
}
