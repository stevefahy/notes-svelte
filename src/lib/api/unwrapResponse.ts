export function unwrapResponse<T extends object>(
  response: unknown
): { ok: true; data: T } | { ok: false; error: string } {
  if (response == null) return { ok: false, error: "No response" };
  const obj = response as Record<string, unknown>;
  if (typeof obj === "object" && "error" in obj && typeof obj.error === "string")
    return { ok: false, error: obj.error };
  if (
    typeof obj === "object" &&
    "success" in obj &&
    obj.success === true
  )
    return { ok: true, data: response as T };
  return { ok: false, error: "Unknown error" };
}
