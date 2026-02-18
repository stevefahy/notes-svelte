<script lang="ts">
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'
  // import { params } from 'svelte-spa-router'
  import { push } from 'svelte-spa-router'
  // import { params, location, push } from 'svelte-spa-router'

  import { initScrollSync, removeScrollSync } from '@/lib/scroll_sync'
  import { authStore } from '@/stores/auth'
  import { notificationStore } from '@/stores/notification'
  import { notebookEditStore } from '@/stores/notebookEdit'
  import { snackStore } from '@/stores/snack'
  import { createNote, getNote, getNotebook, saveNote } from '@/lib/api'
  import APPLICATION_CONSTANTS from '@/lib/constants'
  import type { Note, Notebook } from '@/lib/types'
  import FooterView from '@/components/layout/FooterView.svelte'
  import ViewNote from '@/components/note/ViewNote.svelte'
  import EditNote from '@/components/note/EditNote.svelte'
  import type { NotePageProps } from '@/lib/types'

  const AC = APPLICATION_CONSTANTS

  let { params }: NotePageProps = $props()

  const notebookId = $derived(params?.notebookId)
  const noteId = $derived(params?.noteId)


  let note = $state<Note | null>(null)
  let notebook = $state<Notebook | null>(null)
  let viewText = $state('')
  let originalText = $state('')
  let noteLoaded = $state(false)
  let isViewMode = $state(true)
  let isSplitScreen = $state(false)
  let isMobile = $state(false)
  const isCreate = $derived(noteId === 'create-note')

  const showEditPane = $derived(isViewMode || isSplitScreen)
  const showViewPane = $derived(!isViewMode || isSplitScreen)

  const showNotification = (msg: string) => {
    notificationStore.ShowNotification({
      notification: { n_status: 'error', title: 'Error!', message: msg }
    })
  }

  const loadNotebook = async () => {
    const token = get(authStore).token
    if (!token || !notebookId) return
    const response = await getNotebook(token, notebookId)
    if (response && 'success' in response && response.success) {
      notebook = response.notebook
      notebookEditStore.update((s) => ({ ...s, edited: response.notebook }))
    }
  }

  const loadNote = async () => {
    if (noteId === 'create-note') {
      viewText = ''
      noteLoaded = true
      return
    }
    const token = get(authStore).token
    if (!token || !notebookId || !noteId) return
    const response = await getNote(token, notebookId, noteId)
    if (response && 'error' in response) {
      showNotification(response.error ?? 'Unknown error')
      return
    }
    if (response && 'success' in response && response.success) {
      note = response.note
      viewText = response.note.note
      originalText = response.note.note
      noteLoaded = true
    }
  }

  const isChanged = $derived(viewText !== originalText)

  const handleCreateNote = async (noteContent: string) => {
    const token = get(authStore).token
    if (!token || !notebookId) return
    const response = await createNote(token, { notebookId, note: noteContent })
    if (response && 'error' in response) {
      showNotification(response.error ?? 'Unknown error')
      return
    }
    if (response && 'success' in response) {
      push(`/notebook/${notebookId}`)
    }
  }

  const handleSaveNote = async (noteContent: string) => {
    const token = get(authStore).token
    if (!token || !notebookId || !noteId || noteId === 'create-note') return
    const response = await saveNote(token, notebookId, noteId, noteContent)
    if (response && 'error' in response) {
      showNotification(response.error ?? 'Unknown error')
      return
    }
    originalText = noteContent
    snackStore.ShowSnack({ n_status: true, message: 'Note Saved' })
  }

  const handleViewTextUpdate = (text: string) => {
    viewText = text
  }

  const toggleViewEdit = async () => {
    if (isChanged) await handleSaveNote(viewText)
    isViewMode = !isViewMode
  }

  const toggleSplitScreen = () => {
    isSplitScreen = !isSplitScreen
  }

  const loadExampleNote = async () => {
    try {
      const res = await fetch('/markdown/welcome_markdown_angular.md')
      if (res.ok) viewText = await res.text()
      else viewText = '# Example Note\n\nStart typing your note here...'
    } catch {
      viewText = '# Example Note\n\nStart typing your note here...'
    }
  }

  const checkMobile = () => {
    isMobile = window.innerWidth < AC.SPLITSCREEN_MINIMUM_WIDTH
    if (isMobile) isSplitScreen = false
  }

  $effect(() => {
    if (!noteLoaded) return
    const t = setTimeout(() => initScrollSync(), 500)
    return () => {
      clearTimeout(t)
      removeScrollSync()
    }
  })

  onMount(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
    ;(async () => {
      await authStore.getAuth()
      await loadNotebook()
      await loadNote()
      // View mode for existing notes, Edit mode for create-note (matching Vue)
      isViewMode = noteId === 'create-note'
    })()
    return () => window.removeEventListener('resize', checkMobile)
  })
</script>

{#if !noteLoaded}
  <div class="loading_routes">Loading...</div>
{:else}
  <div class="page_scrollable_header_breadcrumb_footer">
    <div class="view_container {isSplitScreen ? 'editnote_box_split' : ''}" id="view_container">
      <ViewNote
        viewText={viewText}
        onEdit={(t) => handleViewTextUpdate(t)}
        visible={showViewPane}
        splitScreen={isSplitScreen}
      />
      <EditNote
        loadedText={viewText}
        onUpdate={(t) => handleViewTextUpdate(t)}
        visible={showEditPane}
        splitScreen={isSplitScreen}
      />
    </div>
  </div>
  <FooterView>
    {#if isCreate && viewText.length === 0}
      <button class="btn-footer btn-contained" type="button" onclick={loadExampleNote}>
        <span class="material-symbols-outlined button_icon white">egg</span>
        Example
      </button>
    {/if}
    {#if isCreate && viewText.length > 0}
      <button class="btn-footer btn-contained" onclick={() => handleCreateNote(viewText)} type="button">
        <span class="material-symbols-outlined button_icon white">add_circle</span>
        Create Note
      </button>
    {/if}
    {#if !isCreate && isChanged}
      <button class="btn-footer btn-contained v-btn v-btn--elevated v-theme--myCustomLightTheme bg-secondary v-btn--density-default v-btn--size-default v-btn--variant-elevated contained medium" onclick={() => handleSaveNote(viewText)} type="button">
        <span class="material-symbols-outlined button_icon white">add_circle</span>
        Save Note
      </button>
    {/if}
    {#if !isSplitScreen}
      <button
        class="btn-footer btn-contained v-btn v-btn--elevated v-theme--myCustomLightTheme bg-secondary v-btn--density-default v-btn--size-default v-btn--variant-elevated contained medium"
        onclick={toggleViewEdit}
        type="button"
        aria-label={isViewMode ? 'Switch to View' : 'Switch to Edit'}
      >
        {#if isViewMode}
          <span class="material-symbols-outlined white">visibility</span>
          View
        {:else}
          <span class="material-symbols-outlined white">edit</span>
          Edit
        {/if}
      </button>
    {/if}
    {#if !isMobile}
      <button
        class="btn-footer btn-contained split_screen_btn"
        onclick={toggleSplitScreen}
        type="button"
        aria-label="Toggle split screen"
      >
        {#if isSplitScreen}
          <img src="/assets/images/split_screen_icon_single.png" alt="single" width="24" height="24" />
        {:else}
          <img src="/assets/images/split_screen_icon_double.png" alt="double" width="24" height="24" />
        {/if}
      </button>
    {/if}
  </FooterView>
{/if}

