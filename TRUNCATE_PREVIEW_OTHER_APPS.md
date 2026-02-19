# Block-Aware Markdown Thumbnail Truncation — Implementation Guide for Other Frameworks

Use this guide to implement the same thumbnail preview truncation in Vue, Angular, React, and Next.js. The Svelte app already has this implemented.

## Overview

Thumbnail previews in the note list render full markdown for every note. This change truncates the content to the first 10 blocks (paragraphs, code blocks, headings, lists, etc.) before rendering. Benefits:

- **Performance:** Less markdown parsed and rendered per thumbnail
- **Consistency:** Same visual output across all apps
- **Portable:** Pure TypeScript, zero dependencies

## Step 1: Add the Utility File

Copy `src/lib/truncateMarkdownPreview.ts` from the Svelte app into each target app. Suggested locations:

| App      | Destination Path                          |
|----------|--------------------------------------------|
| Vue      | `src/core/lib/truncateMarkdownPreview.ts`  |
| React    | `src/lib/truncateMarkdownPreview.ts`       |
| Angular  | `src/app/core/utils/truncateMarkdownPreview.ts` |
| Next.js  | `lib/truncateMarkdownPreview.ts`           |

The file contents are identical in all apps. See the full source below.

---

## Step 2: Full Source — `truncateMarkdownPreview.ts`

```typescript
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
```

---

## Step 3: Framework-Specific Changes

### Vue — `ViewNoteThumb.vue`

**File:** `src/components/note/ViewNoteThumb.vue`

Vue currently passes raw `text` to ViewNoteMarkdown. Add `matter` and `truncateMarkdownPreview`.

**Add imports:**
```typescript
import matter from 'gray-matter'
import { truncateMarkdownPreview } from '@/core/lib/truncateMarkdownPreview'
```

**In the watch callback, derive truncated content before assigning:**
```typescript
watch(
  text,
  (val: any) => {
    const { content: raw } = matter(val ?? '')
    content = truncateMarkdownPreview(raw)
    hideSkeleton()
  },
  { deep: true, immediate: true }
)
```

**Note:** Vue uses a mutable `content` variable that’s assigned in the watch. Ensure you assign the truncated value:
```typescript
let content: string

watch(
  text,
  (val: any) => {
    const { content: raw } = matter(val ?? '')
    content = truncateMarkdownPreview(raw)
    hideSkeleton()
  },
  { deep: true, immediate: true }
)
```

---

### React — `viewnotethumb.tsx`

**File:** `src/components/note/viewnotethumb.tsx`

React already uses `matter(props.text).content`. Wrap it with `truncateMarkdownPreview`.

**Add import:**
```typescript
import { truncateMarkdownPreview } from '../lib/truncateMarkdownPreview'
```

**Change the content derivation:**
```typescript
const { content: rawContent } = matter(props.text)
const content = truncateMarkdownPreview(rawContent)
```

**Pass `content` to ViewNoteMarkdown** (it already does; just ensure it uses the truncated `content`).

---

### Angular — `viewnotethumb.component.ts`

**File:** `src/app/features/viewnote/components/viewnotethumb/viewnotethumb.component.ts`

Angular’s `text` setter assigns `matter(val).content` to `this.content`. Add truncation.

**Add import:**
```typescript
import { truncateMarkdownPreview } from '../../../../core/utils/truncateMarkdownPreview'
```

**Change the setter:**
```typescript
@Input()
set text(val: string) {
  const raw = matter(val).content
  this.content = truncateMarkdownPreview(raw)
  this.hideSkeleton()
}
```

Adjust the import path if you place the utility in a different folder (e.g. `src/app/shared/utils/`).

---

### Next.js — `viewnotethumb.tsx`

**File:** `components/note/viewnotethumb.tsx`

Same pattern as React. Next.js uses `matter(props.text)` and passes `content` to ViewNoteMarkdown.

**Add import:**
```typescript
import { truncateMarkdownPreview } from '../../lib/truncateMarkdownPreview'
```

**Change the content derivation:**
```typescript
const { content: rawContent } = matter(props.text)
const content = truncateMarkdownPreview(rawContent)
```

Pass `content` to ViewNoteMarkdown.

---

## Verification

After implementing:

1. Thumbnails show the first ~10 blocks of each note.
2. Long notes render less markdown; list pages with many notes should feel snappier.
3. Code blocks, lists, and headings are not cut mid-block.
4. Existing CSS (`max-height`, `overflow: hidden`) stays as-is.

---

## Dependencies

The truncation utility has **zero dependencies**. Each app already has `gray-matter` for frontmatter parsing. No new packages are required.
