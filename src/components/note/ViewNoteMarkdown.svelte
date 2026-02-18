<script lang="ts">
  import { renderMarkdown } from '@/lib/markdown'

  interface Props {
    viewText: string
    disableLinks?: boolean
  }
  let { viewText, disableLinks = false }: Props = $props()

  const html = $derived(renderMarkdown(viewText, disableLinks))
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css" />
</svelte:head>

<span class="viewnote_content" data-viewnote-markdown>
  {@html html}
</span>

<style>
  .codebox pre {
    box-shadow: rgba(0, 0, 0, 0.4) 1.95px 1.95px 2.6px;
  }

  .codebox_language p {
    padding-left: 5px;
  }

  .image {
    display: inline-block;
    vertical-align: top;
  }

  .image img {
    display: block;
    max-width: 100%;
    width: auto;
    height: auto;
  }

  :global(.test_imagex) {
    display: inline-block;
    vertical-align: top;
  }
</style>
