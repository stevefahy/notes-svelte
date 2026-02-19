<script lang="ts">
  import { renderMarkdown } from "@/lib/markdown";

  interface Props {
    viewText: string;
    disableLinks?: boolean;
  }
  let { viewText, disableLinks = false }: Props = $props();

  const html = $derived(renderMarkdown(viewText, disableLinks));
</script>

<span class="viewnote_content" data-viewnote-markdown>
  {@html html}
</span>
