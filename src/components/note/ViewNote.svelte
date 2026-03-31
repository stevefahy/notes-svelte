<script lang="ts">
  import ViewNoteMarkdown from "./ViewNoteMarkdown.svelte";

  interface Props {
    viewText: string;
    onEdit?: (text: string) => void;
  }
  let { viewText, onEdit }: Props = $props();
</script>

<div id="view" class="note-pane note-pane--view view editnote_box">
  <div class="note-pane-scroll">
    <div class="note-card">
      <div class="v-card-text cardcontent viewnote_content">
        <ViewNoteMarkdown {viewText} onViewTextUpdate={onEdit} />
      </div>
    </div>
  </div>
</div>
