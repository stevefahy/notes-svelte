<script lang="ts">
  import ViewNoteMarkdown from "./ViewNoteMarkdown.svelte";

  interface Props {
    viewText: string;
    onEdit?: (text: string) => void;
    visible?: boolean;
    splitScreen?: boolean;
  }
  let {
    viewText,
    onEdit,
    visible = true,
    splitScreen = false,
  }: Props = $props();
</script>

<div
  id="view"
  class="view editnote_box {splitScreen
    ? 'view_split show'
    : ''} {!splitScreen && visible ? 'show' : ''} {!splitScreen && !visible
    ? 'hide'
    : ''}"
>
  <div class="note-card">
    <div class="v-card-text cardcontent viewnote_content">
      <ViewNoteMarkdown {viewText} onViewTextUpdate={onEdit} />
    </div>
  </div>
</div>
