import { writable } from "svelte/store";
import type { ButtonSize } from "@/lib/types";

function createMobileSizeStore() {
  const { subscribe, set } = writable<ButtonSize>("default");

  return { subscribe, set };
}

export const mobileSizeStore = createMobileSizeStore();
