<script lang="ts">
  import APPLICATION_CONSTANTS from '@/lib/constants'
  import { FolderOptions } from '@/lib/folderOptions'
  import ErrorAlert from '@/components/UI/ErrorAlert.svelte'
  import type { NotebookCoverType } from '@/lib/types'
  import { vCard, vCardText } from '@/lib/vuetify-classes'

  interface Props {
    method?: 'create' | 'edit'
    notebook?: { notebook_name: string; notebook_cover: NotebookCoverType }
    onAddNotebook?: (name: string, cover: string) => void | Promise<void>
    onCancel: () => void
  }
  let { method = 'create', notebook, onAddNotebook, onCancel }: Props = $props()

  const AC = APPLICATION_CONSTANTS

  let selectedCover = $state<NotebookCoverType>('default')
  let selectedName = $state('')

  $effect(() => {
    if (method === 'edit' && notebook) {
      selectedCover = notebook.notebook_cover
      selectedName = notebook.notebook_name
    }
  })

  const originalName = $derived(method === 'edit' && notebook ? notebook.notebook_name : '')
  const originalCover = $derived(
    method === 'edit' && notebook ? notebook.notebook_cover : ('default' as NotebookCoverType)
  )

  const formChanged = $derived.by(() => {
    if (method === 'create') {
      return (
        selectedName.length >= AC.NOTEBOOK_NAME_MIN &&
        selectedName.length <= AC.NOTEBOOK_NAME_MAX
      )
    }
    // Edit mode: changed from original AND name is valid
    const hasChange = selectedName !== originalName || selectedCover !== originalCover
    const nameValid =
      selectedName.length >= AC.NOTEBOOK_NAME_MIN &&
      selectedName.length <= AC.NOTEBOOK_NAME_MAX
    return hasChange && nameValid
  })

  const isConfirmDisabled = $derived(!formChanged)

  let error = $state({ error_state: false, message: '' })

  const cancelHandler = (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    error = { error_state: false, message: '' }
    onCancel()
  }

  const submitHandler = async (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    if (isConfirmDisabled) return
    error = { error_state: false, message: '' }

    if (!selectedName || selectedName.length < AC.NOTEBOOK_NAME_MIN) {
      error = { error_state: true, message: AC.NOTEBOOK_NAME_MIN_ERROR }
      return
    }
    if (selectedName.length > AC.NOTEBOOK_NAME_MAX) {
      error = { error_state: true, message: AC.NOTEBOOK_NAME_MAX_ERROR }
      return
    }
    const cover = selectedCover || 'default'
    await onAddNotebook?.(selectedName, cover)
  }

  function focusDialog(node: HTMLElement) {
    node.focus()
    return {}
  }
</script>

<div class="modal-container">
  <div
    class="modal-overlay"
    role="button"
    tabindex="0"
    aria-label="Close dialog"
    onclick={(e) => cancelHandler(e)}
    onkeydown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    cancelHandler(e)
  }
}}
  ></div>
  <div
    class={vCard('card', 'modal-dialog', 'dialogue_container')}
    role="dialog"
    aria-modal="true"
    aria-labelledby="add-notebook-title"
    tabindex="-1"
    use:focusDialog
    onkeydown={(e) => e.key === 'Escape' && cancelHandler(e)}
  >
    <div class={vCardText()}>
      <h2 id="add-notebook-title" class="dialogue-title">
        {method === 'edit' ? 'Edit Notebook' : 'Add Notebook'}
      </h2>
      <form onsubmit={submitHandler} class="form">
        <div class="control">
          <label for="new-notebook">Name</label>
          <input type="text" id="new-notebook" bind:value={selectedName} />
        </div>
        <div class="control">
          <label for="new-notebook-cover">Cover</label>
          <select id="new-notebook-cover" class="select_dialogue" bind:value={selectedCover}>
            {#each FolderOptions as folder}
              <option value={folder.value}>{folder.viewValue}</option>
            {/each}
          </select>
        </div>
      </form>
      <div class="button_row">
        <div class="action">
          <button
            type="button"
            class="btn-contained v-btn--size-default"
            disabled={isConfirmDisabled}
            onclick={(e) => submitHandler(e)}
            aria-label={method === 'edit' ? 'Edit notebook button' : 'Add notebook button'}
          >
            {method === 'edit' ? 'Confirm' : 'Add'}
          </button>
        </div>
        <div>
          <button type="button" class="btn-contained v-btn--size-default" onclick={cancelHandler} aria-label="Cancel button">
            <span class="icon_text">
              <span class="material-symbols-outlined button_icon white">cancel</span>
              Cancel
            </span>
          </button>
        </div>
      </div>
      {#if error.error_state}
        <ErrorAlert error_state={error.error_state} message={error.message} />
      {/if}
    </div>
  </div>
</div>

<style>
  .button_row {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .form {
    width: 100%;
    margin: 1rem auto;
  }

  .control {
    display: flex;
    margin-bottom: 0.5rem;
    flex-direction: row;
    align-items: flex-start;
    gap: 5px;
    flex-wrap: nowrap;
    width: 100%;
    justify-content: space-evenly;
  }

  .control label {
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #353336;
    display: block;
  }

  .control input {
    display: block;
    font: inherit;
    max-width: 100%;
    width: 100%;
    border-radius: 4px;
    border: 1px solid #38015c;
    padding: 0.25rem;
    background-color: #f7f0fa;
  }

  .modal-container {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }

  /* .modal-dialog {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1001;
    cursor: default;
    background-color: white;
  } */

  /* .dialogue_container {
    max-width: 300px;
  } */

  .select_dialogue {
    width: 100%;
    display: block;
    font: inherit;
    border-radius: 4px;
    border: 1px solid #38015c;
    padding: 0.25rem;
    background-color: #f7f0fa;
  }

  .action {
    display: flex;
    justify-content: space-between;
  }

  /* .icon_text {
    display: flex;
    align-items: center;
    gap: 4px;
  } */

  .button_icon.white {
    color: white;
  }

  .btn-contained:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  @media only screen and (max-width: 380px) {
    .control {
      gap: 5px;
    }

    .control input {
      font-size: 0.7rem !important;
    }
  }
</style>
