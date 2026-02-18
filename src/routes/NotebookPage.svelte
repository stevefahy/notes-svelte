<script lang="ts">
  import { get } from "svelte/store";
  import { params as paramsStore } from "svelte-spa-router";
  import { authStore } from "@/stores/auth";
  import { notificationStore } from "@/stores/notification";
  import { notebookEditStore } from "@/stores/notebookEdit";
  import {
    getNotebook,
    getNotebooks,
    getNotes,
    deleteNotebook,
    deleteNotes,
    editNotebookDate,
    moveNotes,
  } from "@/lib/api";
  import type { Note, Notebook } from "@/lib/types";
  import FooterView from "@/components/layout/FooterView.svelte";
  import AddNotebookForm from "@/components/notebooks/AddNotebookForm.svelte";
  import SelectNotebookForm from "@/components/notebooks/SelectNotebookForm.svelte";
  import NoteList from "@/components/note/NoteList.svelte";
  import { push, link, location } from "svelte-spa-router";

  interface Props {
    params?: Record<string, string> | null;
  }
  let { params: routeParams }: Props = $props();

  // notebookId: params from router, then store, then parse from window.location.hash
  const notebookId = $derived.by(() => {
    const fromParams = (routeParams ?? $paramsStore)?.notebookId;
    if (fromParams) return fromParams;
    const loc = $location;
    if (loc) {
      const m = /^\/notebook\/([^/]+)/.exec(loc);
      if (m?.[1]) return m[1];
    }
    // Fallback: parse from hash (available before store updates)
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const hashMatch = /#?\/notebook\/([^/]+)/.exec(hash);
    return hashMatch?.[1] ?? null;
  });

  let notes = $state<Note[] | null>(null);
  let notebook = $state<Notebook | null>(null);
  let userNotebooks = $state<Notebook[] | null>(null);
  let notesLoaded = $state(false);
  let notebookLoaded = $state(false);
  let editNotebookMode = $state(false);
  let selectedNotes = $state<string[]>([]);
  let editNotesMode = $state(false);
  let showMoveDialog = $state(false);
  let loadError = $state<string | null>(null);

  const showNotification = (msg: string) => {
    notificationStore.ShowNotification({
      notification: { n_status: "error", title: "Error!", message: msg },
    });
  };

  const sortNotes = (notesList: Note[]) => {
    const copy = notesList.map((x) => ({
      ...x,
      updatedAt:
        x.updatedAt === "No date" || !x.updatedAt
          ? "December 17, 1995 03:24:00"
          : x.updatedAt,
    }));
    copy.sort((a, b) =>
      new Date(a.updatedAt!) > new Date(b.updatedAt!) ? 1 : -1,
    );
    return copy.reverse();
  };

  const loadNotebook = async (nid: string) => {
    try {
      const token = get(authStore).token;
      if (!token) {
        loadError = "Session expired. Redirecting to login.";
        notebookLoaded = true;
        push("/login");
        return;
      }
      const response = await getNotebook(token, nid);
      if (response && "error" in response) {
        showNotification(response.error ?? "Unknown error");
        loadError = response.error ?? null;
        notebookLoaded = true;
        return;
      }
      if (response && "success" in response && response.success) {
        notebook = response.notebook;
        notebookEditStore.update((s) => ({ ...s, edited: response.notebook }));
      }
    } catch (err) {
      loadError = err instanceof Error ? err.message : String(err);
      showNotification(loadError);
    } finally {
      notebookLoaded = true;
    }
  };

  const loadNotes = async (nid: string) => {
    try {
      const token = get(authStore).token;
      if (!token) {
        notesLoaded = true;
        return;
      }
      const response = await getNotes(token, nid);
      if (response && "error" in response) {
        showNotification(response.error ?? "Unknown error");
        loadError = response.error ?? null;
      } else if (
        response &&
        "success" in response &&
        response.success &&
        response.notes
      ) {
        const notesList = Array.isArray(response.notes) ? response.notes : [];
        notes = sortNotes(notesList);
      } else {
        notes = [];
      }
    } catch (err) {
      loadError = err instanceof Error ? err.message : String(err);
      showNotification(loadError);
    } finally {
      notesLoaded = true;
    }
  };

  const loadNotebooks = async () => {
    try {
      const token = get(authStore).token;
      if (!token) return;
      const response = await getNotebooks(token);
      if (response && "error" in response) {
        showNotification(response.error ?? "Unknown error");
        return;
      }
      if (
        response &&
        "success" in response &&
        response.success &&
        response.notebooks
      ) {
        userNotebooks = Array.isArray(response.notebooks)
          ? response.notebooks
          : [];
      } else {
        userNotebooks = [];
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : String(err));
    }
  };

  const addNoteHandler = () => {
    if (notebookId) push(`/notebook/${notebookId}/create-note`);
  };

  const deleteNotebookHandler = async () => {
    if (!confirm("Delete this notebook?")) return;
    const token = get(authStore).token;
    if (!token || !notebookId) return;
    const response = await deleteNotebook(token, notebookId);
    if (response && "error" in response) {
      showNotification(response.error ?? "Unknown error");
      return;
    }
    push("/notebooks");
  };

  const editNotesHandler = () => {
    editNotesMode = true;
  };

  const cancelEditNotesHandler = () => {
    editNotesMode = false;
    selectedNotes = [];
  };

  const moveNoteFormHandler = () => {
    showMoveDialog = true;
  };

  const cancelMoveHandler = () => {
    showMoveDialog = false;
  };

  const deleteNotesHandler = async () => {
    if (selectedNotes.length === 0) return;
    const token = get(authStore).token;
    if (!token) return;
    const response = await deleteNotes(token, selectedNotes);
    if (response && "error" in response) {
      showNotification(response.error ?? "Unknown error");
      return;
    }
    cancelEditNotesHandler();
    if (notebookId) await loadNotes(notebookId);
  };

  const editNotebookBtnHandler = () => {
    editNotebookMode = true;
  };

  const cancelEditNotebook = () => {
    editNotebookMode = false;
    notebookEditStore.update((s) => ({ ...s, editing: false }));
  };

  const saveEditNotebook = async (name: string, cover: string) => {
    const token = get(authStore).token;
    if (!token || !notebook) return;
    const { editNotebook } = await import("@/lib/api");
    const response = await editNotebook(
      token,
      notebook._id,
      name,
      cover,
      new Date().toISOString(),
    );
    if (response && "error" in response) {
      showNotification(response.error ?? "Unknown error");
      return;
    }
    if (response && "success" in response && response.notebook_edited) {
      notebook = response.notebook_edited;
      notebookEditStore.update((s) => ({
        ...s,
        edited: response.notebook_edited,
        editing: false,
      }));
      editNotebookMode = false;
    }
  };

  const getLatestUpdated = (selected: string[]) => {
    const found = selected
      .map((id) => notes?.find((n) => n._id === id))
      .filter(Boolean) as Note[];
    const sorted = sortNotes(found);
    return sorted[0]?.updatedAt;
  };

  const moveNoteHandler = async (targetNotebookId: string) => {
    const token = get(authStore).token;
    if (!token || !notebookId || selectedNotes.length === 0) return;
    const latestUpdatedDate = getLatestUpdated(selectedNotes);
    const response = await moveNotes(
      token,
      targetNotebookId,
      selectedNotes,
      latestUpdatedDate,
    );
    if (response && "error" in response) {
      showNotification(response.error ?? "Unknown error");
      return;
    }
    if (response && "success" in response && response.success) {
      showMoveDialog = false;
      cancelEditNotesHandler();
      if (notebookId) await loadNotes(notebookId);
    }
  };

  $effect(() => {
    if ($notebookEditStore?.editing) {
      editNotebookMode = true;
    }
  });

  $effect(() => {
    const nid = notebookId;
    if (!nid) return;
    notesLoaded = false;
    notebookLoaded = false;
    loadError = null;
    let cancelled = false;
    const run = async () => {
      try {
        await authStore.getAuth();
        if (cancelled) return;
        // Run both in parallel; each sets its own flag when done (with try/catch)
        await Promise.all([loadNotebook(nid), loadNotes(nid), loadNotebooks()]);
      } catch (err) {
        if (!cancelled) {
          loadError = err instanceof Error ? err.message : String(err);
          showNotification(loadError);
          notesLoaded = true;
          notebookLoaded = true;
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  });
</script>

{#if !notebookLoaded || !notesLoaded}
  <div class="loading_routes">Loading...</div>
{:else if loadError}
  <div class="page_scrollable_header_breadcrumb_footer_list">
    <div class="loading_routes error-state">
      <p>{loadError}</p>
      <a href="/notebooks" use:link class="back-link">Back to Notebooks</a>
    </div>
  </div>
  <FooterView>
    <button class="btn-footer btn-contained" onclick={() => push("/notebooks")}>
      <span class="icon_text">
        <span class="material-symbols-outlined button_icon white"
          >arrow_back</span
        >
        Back to Notebooks
      </span>
    </button>
  </FooterView>
{:else}
  <div class="page_scrollable_header_breadcrumb_footer_list">
    {#if notebook && notes !== null}
      <NoteList
        notes={notes ?? []}
        onNotesSelected={(s) => (selectedNotes = s.selected)}
        onNotesEdit={editNotesMode}
        onClearNotesEdit={!editNotesMode}
      />
    {/if}
    {#if showMoveDialog && userNotebooks}
      <SelectNotebookForm
        notebooks={userNotebooks}
        currentNotebookId={notebookId}
        onMoveNotes={moveNoteHandler}
        onCancel={cancelMoveHandler}
      />
    {/if}
    {#if editNotebookMode && notebook}
      <AddNotebookForm
        method="edit"
        {notebook}
        onAddNotebook={async (name, cover) =>
          await saveEditNotebook(name, cover)}
        onCancel={cancelEditNotebook}
      />
    {/if}
  </div>
  <FooterView>
    {#if !editNotesMode}
      <button class="btn-footer btn-contained" onclick={addNoteHandler}>
        <span class="icon_text">
          <span class="material-symbols-outlined button_icon white"
            >note_add</span
          >
          Add Note
        </span>
      </button>
    {/if}
    {#if !editNotesMode && (notes ?? []).length > 0}
      <button class="btn-footer btn-contained" onclick={editNotesHandler}>
        <span class="icon_text">
          <span class="material-symbols-outlined button_icon white">edit</span>
          Edit Notes
        </span>
      </button>
    {/if}
    {#if (notes ?? []).length < 1}
      <button class="btn-footer btn-contained" onclick={deleteNotebookHandler}>
        <span class="icon_text">
          <span class="material-symbols-outlined button_icon white">delete</span
          >
          Delete Notebook
        </span>
      </button>
    {/if}
    {#if editNotesMode && selectedNotes.length > 0}
      <button class="btn-footer btn-contained" onclick={deleteNotesHandler}>
        <span class="icon_text">
          <span class="material-symbols-outlined button_icon white">delete</span
          >
          Delete
        </span>
      </button>
    {/if}
    {#if editNotesMode && selectedNotes.length > 0 && userNotebooks && userNotebooks.length > 1}
      <button class="btn-footer btn-contained" onclick={moveNoteFormHandler}>
        <span class="icon_text">
          <span class="material-symbols-outlined button_icon white symbol_size"
            >flip_to_front</span
          >
          Move
        </span>
      </button>
    {/if}
    {#if editNotesMode}
      <button class="btn-footer btn-contained" onclick={cancelEditNotesHandler}>
        <span class="icon_text">
          <span class="material-symbols-outlined button_icon white">cancel</span
          >
          Cancel
        </span>
      </button>
    {/if}
  </FooterView>
{/if}
