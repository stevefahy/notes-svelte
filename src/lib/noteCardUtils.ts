import fm from "front-matter";

/**
 * Maximum number of plain-text characters shown as the note card title.
 * Increase this value to show longer titles.
 */
export const TITLE_MAX_CHARS = 10;

/**
 * Converts one line of markdown to plain text.
 *
 * Strips (in order):
 *  1. Images entirely  ![alt](url)  — alt text is often dimension metadata
 *  2. Template / wiki variables  {{prefix:text}} → text;  {{text}} → text
 *  3. ATX headings
 *  4. GFM task-list markers
 *  5. Unordered / ordered list markers
 *  6. Blockquotes
 *  7. Custom directives  ::: …
 *  8. Bold / italic / strikethrough
 *  9. Inline code (triple → double → single backticks)
 * 10. Links [text](url) — keep visible text
 * 11. HTML tags
 * 12. Catch-all — remaining markup punctuation
 */
function toPlainText(text: string): string {
  return (
    text
      // 1. Strip images entirely (alt text is often useless: e.g. dimensions)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      // 2. Template/wiki variables  {{prefix:text}} → text
      .replace(/\{\{(?:[^}:]*:)?([^}]*)\}\}/g, "$1")
      // 3. ATX headings
      .replace(/^#{1,6}\s*/, "")
      // 4. Task-list markers
      .replace(/^[-*+]\s+\[[ xX]\]\s*/, "")
      // 5. List markers — unordered then ordered
      .replace(/^[-*+]\s+/, "")
      .replace(/^\d+\.\s+/, "")
      // 6. Blockquote
      .replace(/^>\s*/, "")
      // 7. Custom directive opener/closer  ::: …
      .replace(/^:{3}.*/, "")
      // 8. Bold / italic / strikethrough
      .replace(/[*_~]{1,3}([^*_~\n]*)[*_~]{1,3}/g, "$1")
      // 9. Inline code — triple, double, single backticks
      .replace(/`{3}[^`]*`{3}/g, "")
      .replace(/`{2}([^`]*)`{2}/g, "$1")
      .replace(/`([^`]*)`/g, "$1")
      // 10. Links — keep visible text, drop URL
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      // 11. HTML tags
      .replace(/<[^>]+>/g, "")
      // 12. Remaining markdown punctuation
      .replace(/[*_~`#>|\\{}[\]]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * A line is "structural" if it carries no readable text of its own —
 * horizontal rules, fenced-code openers/closers, custom-directive lines.
 */
const STRUCTURAL_LINE = /^[-*_=]{3,}$|^`{3}|^:{3}/;

/**
 * Extracts the display title from a note's markdown content.
 *
 * Strategy: accumulate plain text from successive non-structural lines
 * (skipping fenced-code block contents entirely) until TITLE_MAX_CHARS
 * characters are gathered, then truncate and append "…".
 *
 * This handles notes that open with a custom container block whose first
 * line is structural (`::: custom …`) but whose second line contributes
 * real text (e.g. bold logo text), followed by body text on later lines.
 */
export function extractNoteTitle(content: string): string {
  if (!content?.trim()) return "Untitled";
  const body = (fm(content).body ?? content).trim();

  const parts: string[] = [];
  let inCodeBlock = false;

  for (const rawLine of body.split("\n")) {
    const trimmed = rawLine.trim();

    // Track fenced-code block boundaries; skip content inside them
    if (/^`{3}/.test(trimmed)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    if (!trimmed) continue;
    if (STRUCTURAL_LINE.test(trimmed)) continue;

    const plain = toPlainText(trimmed);
    if (!plain) continue;

    parts.push(plain);
    // Stop accumulating once we have enough source text
    if (parts.join(" ").length >= TITLE_MAX_CHARS) break;
  }

  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  if (!text) return "Untitled";

  return text.length > TITLE_MAX_CHARS
    ? text.slice(0, TITLE_MAX_CHARS) + "…"
    : text;
}

/**
 * Returns a plain-text preview of the note suitable for the card thumbnail.
 * Strips the first heading, then removes common markdown syntax.
 */
export function extractNotePreview(content: string): string {
  if (!content?.trim()) return "";
  const body = (fm(content).body ?? content).trim();
  const lines = body.split("\n");

  // Drop the first heading line
  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,6}\s/.test(lines[i].trim())) {
      startIdx = i + 1;
      break;
    }
  }

  const remaining = lines
    .slice(startIdx)
    .map((l) =>
      l
        .trim()
        // Fenced code fence lines
        .replace(/^```.*/, "")
        // Blockquote marker
        .replace(/^>\s*/, "")
        // List markers (unordered + ordered + task)
        .replace(/^[-*+]\s+\[[ xX]\]\s*/, "")
        .replace(/^[-*+]\s+/, "")
        .replace(/^\d+\.\s+/, "")
        // Inline code
        .replace(/`[^`]*`/g, (m) => m.slice(1, -1))
        // Bold / italic
        .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
        // Links [text](url) and images ![alt](url)
        .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
        // Headings
        .replace(/^#{1,6}\s+/, "")
        // Table separators
        .replace(/^\|[-| :]+\|$/, "")
        // Remaining pipe chars from table rows — replace with space
        .replace(/\|/g, " ")
        .trim(),
    )
    .filter(Boolean)
    .join(" · ");

  return remaining;
}

/**
 * Detects the primary content type of a note for the tag pill.
 * Exactly one tag is returned per note, in priority order:
 *   todo → table → code → image → list → text → empty
 */
export function detectNoteTag(
  content: string,
): "todo" | "table" | "code" | "image" | "list" | "text" | "empty" {
  if (!content?.trim()) return "empty";
  const body = (fm(content).body ?? content).trim();
  if (!body) return "empty";

  if (/^[ \t]*[-*+]\s+\[[ xX]\]/m.test(body)) return "todo";
  if (/^\|.+\|/m.test(body)) return "table";
  if (/^`{3}/m.test(body)) return "code";
  if (/!\[.*?\]\(.*?\)/m.test(body)) return "image";
  if (/^[ \t]*[-*+]\s+/m.test(body) || /^[ \t]*\d+\.\s+/m.test(body)) return "list";
  if (/\S/.test(body)) return "text";
  return "empty";
}
