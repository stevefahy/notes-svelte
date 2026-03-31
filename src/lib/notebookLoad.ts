import { getNotebook, unwrapResponse } from "@/lib/api";
import { getDisplayCover } from "@/lib/notebookCoverUtils";
import { notebookEditStore } from "@/stores/notebookEdit";
import type { Notebook } from "@/lib/types";

export type LoadNotebookForEditResult =
  | { ok: true; notebook: Notebook }
  | { ok: false; error: string; fromServer?: boolean };

/**
 * Fetches a notebook and syncs {@link notebookEditStore} (cover display + edited fields).
 */
export async function loadNotebookForEdit(
  token: string,
  notebookId: string,
): Promise<LoadNotebookForEditResult> {
  const result = unwrapResponse<{ notebook: Notebook }>(
    await getNotebook(token, notebookId),
  );
  if (!result.ok) {
    return {
      ok: false,
      error: result.error ?? "Unknown error",
      fromServer: result.fromServer,
    };
  }
  const nb = result.data.notebook;
  if (!nb) {
    return { ok: false, error: "Notebook not found", fromServer: true };
  }
  notebookEditStore.update((s) => ({
    ...s,
    edited: { ...nb, notebook_cover: getDisplayCover(nb.notebook_cover) },
  }));
  return { ok: true, notebook: nb };
}
