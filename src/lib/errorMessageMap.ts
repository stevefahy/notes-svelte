export function toUserFriendlyError(raw: string): string {
  const str = typeof raw === "string" ? raw : String(raw ?? "Unknown error");
  const lower = str.toLowerCase();
  if (
    lower.includes("failed to fetch") ||
    lower.includes("load failed") ||
    lower.includes("networkerror")
  )
    return "Please check your network and try again.";
  if (lower.includes("not found") || lower.includes("404"))
    return "The requested resource was not found.";
  if (lower.includes("500") || lower.includes("internal server error"))
    return "Something went wrong. Please try again later.";
  if (
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("aborted")
  )
    return "The request took too long. Please try again.";
  if (lower.includes("cors") || lower.includes("cross-origin"))
    return "A connection error occurred. Please try again.";
  if (
    lower.includes("unexpected end of json") ||
    (lower.includes("json") && lower.includes("unexpected"))
  )
    return "The server could not be reached. Please try again.";
  return str;
}
