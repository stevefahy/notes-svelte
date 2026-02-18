<script lang="ts">
  import ViewNoteMarkdown from './ViewNoteMarkdown.svelte'

  interface Props {
    text: string
  }
  let { text }: Props = $props()
</script>

<div class="box">
  <article class="viewnote_content viewnote_thumb">
    <ViewNoteMarkdown viewText={text} disableLinks={true} />
  </article>
</div>

<style>
  .edit {
    background-color: aliceblue;
    outline: 0px solid transparent;
  }

  .box {
    display: flex;
    flex-flow: column;
    max-height: 200px;
    overflow: hidden;
  }

  .box .row {
    border: 1px dotted grey;
  }

  .box .row.header {
    flex: 0 1 auto;
  }

  .box .row.content {
    flex: 1 1 auto;
  }

  .box .row.footer {
    flex: 0 1 40px;
  }
</style>
