<script lang="ts">
  import ViewNoteMarkdown from './ViewNoteMarkdown.svelte'
  import { vCard, vCardText } from '@/lib/vuetify-classes'

  interface Props {
    viewText: string
    onEdit?: (text: string) => void
    visible?: boolean
    splitScreen?: boolean
  }
  let { viewText, onEdit, visible = true, splitScreen = false }: Props = $props()
</script>

<div
  id="view"
  class="view editnote_box {splitScreen ? 'view_split show' : ''} {!splitScreen && visible ? 'show' : ''} {!splitScreen && !visible ? 'hide' : ''}"
>
  <div class="note-card {vCard()}">
    <div class={vCardText('cardcontent viewnote_content')}>
      <ViewNoteMarkdown viewText={viewText} />
    </div>
  </div>
</div>

<style>
  @import url('../../assets/styles/notebook-list-shared-css.scss');
</style>
