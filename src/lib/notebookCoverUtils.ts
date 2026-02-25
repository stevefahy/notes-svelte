import type { NotebookCoverType } from "./types";

/** Maps legacy cover values from API to new theme cover types for display */
const LEGACY_COVER_MAP: Record<string, NotebookCoverType> = {
  default: "sage",
  red: "forest",
  green: "lime",
  blue: "emerald",
};

/** Returns the display cover type, mapping legacy values to new theme colors */
export function getDisplayCover(cover: string | undefined): NotebookCoverType {
  if (!cover) return "sage";
  const normalized = cover.toLowerCase();
  return (LEGACY_COVER_MAP[normalized] ?? normalized) as NotebookCoverType;
}
