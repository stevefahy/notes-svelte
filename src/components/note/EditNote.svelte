<script lang="ts">
  import { onMount } from 'svelte'
  import { vCard, vCardText } from '@/lib/vuetify-classes'

  interface Props {
    loadedText: string
    onUpdate: (text: string) => void
    visible?: boolean
    splitScreen?: boolean
  }
  let { loadedText, onUpdate, visible = false, splitScreen = false }: Props = $props()

  let editRef: HTMLDivElement

  $effect(() => {
    if (editRef && loadedText !== undefined) {
      const current = editRef.innerText || ''
      if (current !== loadedText) {
        editRef.innerText = loadedText
      }
    }
  })

  const handleInput = () => {
    if (editRef) onUpdate(editRef.innerText || '')
  }

  onMount(() => {
    if (editRef && !loadedText && editRef.innerText === '') {
      editRef.focus()
    }
  })

  const showPane = $derived(visible || splitScreen)
</script>

<div
  id="edit"
  class="edit editnote_box {splitScreen ? 'view_split show' : ''} {!splitScreen && showPane ? 'show' : ''} {!splitScreen && !showPane ? 'hide' : ''}"
>
  <div class="edit-note">
    <div class="note-card {vCard()}">
    <article class={vCardText('viewnote_content editor')}>
      <div
      bind:this={editRef}
      contenteditable={showPane ? 'true' : 'false'}
      class="viewnote_content editable"
      data-placeholder="Start writing..."
      oninput={handleInput}
      role="textbox"
    ></div>
    </article>
  </div>
</div>
</div>
