import { normalizeErrorToString } from "./errorMessageMap";

export const errString = (err: unknown, customError: string = ""): string => {
  if (err instanceof Error && err.message) {
    return customError ? `${customError}\n${err.message}` : err.message;
  }
  return normalizeErrorToString(err, customError || "Unknown error");
};
