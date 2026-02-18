<script lang="ts">
  import { renderMarkdown } from "@/lib/markdown";

  interface Props {
    viewText: string;
    disableLinks?: boolean;
  }
  let { viewText, disableLinks = false }: Props = $props();

  const html = $derived(renderMarkdown(viewText, disableLinks));
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
  />
</svelte:head>

<span class="viewnote_content" data-viewnote-markdown>
  {@html html}
</span>
