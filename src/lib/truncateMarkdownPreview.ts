/**
 * Truncates markdown content to the first N blocks for thumbnail previews.
 * Block-aware: preserves fenced code blocks, paragraphs, headings, lists, blockquotes.
 * Zero dependencies — portable to Vue, Angular, React, Next.js.
 */
export function truncateMarkdownPreview(
  content: string,
  maxBlocks = 10
): string {
  if (!content?.trim()) return "";

  const lines = content.split("\n");
  const blocks: string[] = [];
  let i = 0;
  let currentBlock: string[] = [];

  while (i < lines.length && blocks.length < maxBlocks) {
    const line = lines[i];
    const trimmed = line.trim();

    // Fenced code block (``` or ```lang)
    if (trimmed.startsWith("```")) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join("\n"));
        currentBlock = [];
      }
      currentBlock = [line];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        currentBlock.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        currentBlock.push(lines[i]);
        i++;
      }
      blocks.push(currentBlock.join("\n"));
      currentBlock = [];
      continue;
    }

    // Blank line — end of paragraph/block
    if (trimmed === "") {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join("\n"));
        currentBlock = [];
      }
      i++;
      continue;
    }

    // Block-level element starting a new block
    const isHeading = /^#{1,6}\s/.test(trimmed);
    const isList = /^[-*+]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed);
    const isBlockquote = trimmed.startsWith(">");
    const isTableRow = /^\|/.test(trimmed);

    if (
      (isHeading || isList || isBlockquote || isTableRow) &&
      currentBlock.length > 0
    ) {
      blocks.push(currentBlock.join("\n"));
      currentBlock = [];
    }

    currentBlock.push(line);
    i++;
  }

  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join("\n"));
  }

  return blocks.slice(0, maxBlocks).join("\n\n");
}
