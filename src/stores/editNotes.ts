import { writable } from "svelte/store";

function createEditNotesStore() {
  const { subscribe, set, update } = writable<{
    active: boolean;
    selectedCount: number;
  }>({
    active: false,
    selectedCount: 0,
  });

  return { subscribe, set, update };
}

export const editNotesStore = createEditNotesStore();
