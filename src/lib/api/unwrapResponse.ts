function normalizeError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error != null) return String(error);
  return "Unknown error";
}

export function unwrapResponse<T extends object>(
  response: unknown
): { ok: true; data: T } | { ok: false; error: string; fromServer?: boolean } {
  if (response == null) return { ok: false, error: "No response", fromServer: false };
  const obj = response as Record<string, unknown>;
  if (typeof obj === "object" && "error" in obj && obj.error != null)
    return {
      ok: false,
      error: normalizeError(obj.error),
      fromServer: obj.fromServer === true,
    };
  if (
    typeof obj === "object" &&
    "success" in obj &&
    obj.success === true
  )
    return { ok: true, data: response as T };
  return { ok: false, error: "Unknown error", fromServer: false };
}
