<script lang="ts">
  import fm from "front-matter";
  import ViewNoteMarkdown from "./ViewNoteMarkdown.svelte";
  import { truncateMarkdownPreview } from "@/lib/truncateMarkdownPreview";

  interface Props {
    text: string;
  }
  let { text }: Props = $props();

  const previewText = $derived(
    truncateMarkdownPreview(fm(text).body ?? ""),
  );
</script>

<div class="box">
  <article class="viewnote_content viewnote_thumb">
    <ViewNoteMarkdown viewText={previewText} disableLinks={true} />
  </article>
</div>

<style>
  .box {
    display: flex;
    flex-flow: column;
    max-height: 200px;
    overflow: hidden;
  }
</style>
