import { writable } from "svelte/store";
import type { Edited } from "@/lib/types";

function createNotebookEditStore() {
  const { subscribe, set, update } = writable<{
    editing?: boolean;
    edited?: Edited;
  }>({
    editing: undefined,
    edited: undefined,
  });

  return { subscribe, set, update };
}

export const notebookEditStore = createNotebookEditStore();
