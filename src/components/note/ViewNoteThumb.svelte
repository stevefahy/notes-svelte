<script lang="ts">
  import ViewNoteMarkdown from "./ViewNoteMarkdown.svelte";

  interface Props {
    text: string;
  }
  let { text }: Props = $props();
</script>

<div class="box">
  <article class="viewnote_content viewnote_thumb">
    <ViewNoteMarkdown viewText={text} disableLinks={true} />
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
