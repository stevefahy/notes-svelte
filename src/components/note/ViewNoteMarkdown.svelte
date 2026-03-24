<script lang="ts">
  import { scrollToElementByHtmlId } from "@/lib/markdownScroll";

  const TASK_LINE_RE = /^\s*[-*+]\s+\[[xX \u00a0]\s*\]/;

  interface Props {
    viewText: string;
    disableLinks?: boolean;
    onViewTextUpdate?: (text: string) => void;
  }
  let { viewText, disableLinks = false, onViewTextUpdate }: Props = $props();

  let renderMarkdown = $state<
    ((text: string, disableLinks?: boolean) => string) | null
  >(null);
  let matterFn = $state<{
    (input: string): { content: string; data: Record<string, unknown> };
    stringify(content: string, data?: Record<string, unknown>): string;
  } | null>(null);

  $effect(() => {
    if (renderMarkdown && matterFn) return;
    import("@/lib/markdown").then((mod) => {
      renderMarkdown = mod.renderMarkdown;
      matterFn = mod.matter;
    });
  });

  const html = $derived(
    renderMarkdown ? renderMarkdown(viewText, disableLinks) : "",
  );

  const isReadOnly = $derived(!onViewTextUpdate);

  function handleMarkdownPointer(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (onViewTextUpdate && target.tagName === "INPUT") {
      return;
    }

    const foot = target.closest<HTMLElement>("[data-md-footnote-scroll]");
    if (foot) {
      const to = foot.getAttribute("data-md-footnote-scroll");
      if (to) {
        event.preventDefault();
        scrollToElementByHtmlId(to);
      }
      return;
    }

    const anchor = target.closest<HTMLElement>(
      ".md_anchorlink[data-md-target-id]",
    );
    if (anchor) {
      const id = anchor.getAttribute("data-md-target-id");
      if (id) {
        event.preventDefault();
        scrollToElementByHtmlId(id);
      }
    }
  }

  function handleMarkdownKeyDown(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target as HTMLElement;
    const anchor = target.closest<HTMLElement>(
      ".md_anchorlink[data-md-target-id]",
    );
    if (!anchor || !anchor.contains(target)) return;
    const id = anchor.getAttribute("data-md-target-id");
    if (!id) return;
    event.preventDefault();
    scrollToElementByHtmlId(id);
  }

  function handleCheckboxClick(event: MouseEvent) {
    if (!onViewTextUpdate || !matterFn) return;
    const target = event.target as HTMLInputElement;
    if (target.tagName !== "INPUT" || target.type !== "checkbox") return;
    const id = target.id;
    if (!id || !id.startsWith("cbx_")) return;
    const taskIndex = parseInt(id.slice(4), 10);
    if (isNaN(taskIndex) || taskIndex < 0) return;

    const checked = target.checked;

    const parsed = matterFn(viewText);
    const content = parsed.content;
    const lines = content.split("\n");
    let nth = 0;
    for (let i = 0; i < lines.length; i++) {
      if (TASK_LINE_RE.test(lines[i])) {
        if (nth === taskIndex) {
          lines[i] = lines[i].replace(
            /\[\s*(x|\s)\s*\]/i,
            checked ? "[x]" : "[ ]",
          );
          const newContent = lines.join("\n");
          const updatedFull =
            Object.keys(parsed.data).length > 0
              ? matterFn.stringify(newContent, parsed.data)
              : newContent;
          onViewTextUpdate(updatedFull);
          return;
        }
        nth++;
      }
    }
  }

  function handleClick(event: MouseEvent) {
    handleMarkdownPointer(event);
    handleCheckboxClick(event);
  }
</script>

<span
  class="viewnote_content {isReadOnly ? 'md-readonly' : ''}"
  data-viewnote-markdown
  onclick={handleClick}
  onkeydown={handleMarkdownKeyDown}
  role={onViewTextUpdate ? "presentation" : undefined}
>
  {@html html}
</span>
