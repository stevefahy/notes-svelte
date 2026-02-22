<script lang="ts">
  const TASK_LINE_RE = /^\s*[-*+]\s+\[[xX \u00a0]\s*\]/;

  interface Props {
    viewText: string;
    disableLinks?: boolean;
    onViewTextUpdate?: (text: string) => void;
  }
  let { viewText, disableLinks = false, onViewTextUpdate }: Props = $props();

  let renderMarkdown = $state<((text: string, disableLinks?: boolean) => string) | null>(
    null,
  );
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
</script>

<span
  class="viewnote_content {isReadOnly ? "md-readonly" : ""}"
  data-viewnote-markdown
  onclick={onViewTextUpdate ? handleCheckboxClick : undefined}
  role={onViewTextUpdate ? "presentation" : undefined}
>
  {@html html}
</span>
