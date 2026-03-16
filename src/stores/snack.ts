import { writable } from "svelte/store";
import type { Snack } from "@/lib/types";
import { toUserFriendlyError } from "@/lib/errorMessageMap";

const initialState: Snack = {
  n_status: false,
  message: null,
};

function createSnackStore() {
  const { subscribe, set } = writable(initialState);

  const ShowSnack = (param: Snack) => {
    set(param);
  };

  return { subscribe, ShowSnack };
}

export const snackStore = createSnackStore();

export type ShowSnackOptions = {
  message: string;
  variant?: "success" | "error" | "warning";
};

export function showSnack({
  message,
  variant = "success",
}: ShowSnackOptions): void {
  snackStore.ShowSnack({
    n_status: true,
    message,
    variant,
  });
}

export type ShowErrorSnackOptions = {
  fromServer?: boolean;
};

export function showErrorSnack(
  message: string,
  options?: ShowErrorSnackOptions,
): void {
  const display =
    options?.fromServer === true ? message : toUserFriendlyError(message);
  showSnack({
    message: display,
    variant: "error",
  });
}
