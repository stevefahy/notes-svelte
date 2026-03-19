<script lang="ts">
  import { get } from "svelte/store";
  import { params as paramsStore } from "svelte-spa-router";
  import { authStore } from "@/stores/auth";
  import { showErrorSnack } from "@/stores/snack";
  import { notebookEditStore } from "@/stores/notebookEdit";
  import { editNotesStore } from "@/stores/editNotes";
  import {
    getNotebook,
    getNotebooks,
    getNotes,
    deleteNotebook,
    deleteNotes,
    moveNotes,
    unwrapResponse,
  } from "@/lib/api";
  import { getDisplayCover } from "@/lib/notebookCoverUtils";
  import type { Note, Notebook, SelectedNote } from "@/lib/types";
  import FooterView from "@/components/layout/FooterView.svelte";
  import AddNotebookForm from "@/components/notebooks/AddNotebookForm.svelte";
  import SelectNotebookForm from "@/components/notebooks/SelectNotebookForm.svelte";
  import NoteList from "@/components/note/NoteList.svelte";
  import { onMount, onDestroy } from "svelte";
  import { push } from "@/lib/router";
import { link, location } from "svelte-spa-router";

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

  const handleNotesSelected = (selected: SelectedNote) => {
    selectedNotes = selected.selected;
    editNotesStore.update((s) => ({
      ...s,
      selectedCount: selected.selected.length,
    }));
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
      const result = unwrapResponse<{ notebook: Notebook }>(
        await getNotebook(token, nid),
      );
      if (!result.ok) {
        showErrorSnack(result.error ?? "Unknown error", {
          fromServer: result.fromServer,
        });
        loadError = result.error ?? null;
        notebookLoaded = true;
        return;
      }
      if (result.data.notebook) {
        const nb = result.data.notebook;
        notebook = nb;
        notebookEditStore.update((s) => ({
          ...s,
          edited: { ...nb, notebook_cover: getDisplayCover(nb.notebook_cover) },
        }));
      }
    } catch (err) {
      loadError = err instanceof Error ? err.message : String(err);
      showErrorSnack(loadError, { fromServer: false });
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
      const result = unwrapResponse<{ notes: Note[] }>(
        await getNotes(token, nid),
      );
      if (!result.ok) {
        showErrorSnack(result.error ?? "Unknown error", {
          fromServer: result.fromServer,
        });
        loadError = result.error ?? null;
      } else if (result.data.notes) {
        const notesList = Array.isArray(result.data.notes)
          ? result.data.notes
          : [];
        notes = sortNotes(notesList);
      } else {
        notes = [];
      }
    } catch (err) {
      loadError = err instanceof Error ? err.message : String(err);
      showErrorSnack(loadError, { fromServer: false });
    } finally {
      notesLoaded = true;
    }
  };

  const loadNotebooks = async () => {
    try {
      const token = get(authStore).token;
      if (!token) return;
      const result = unwrapResponse<{ notebooks: Notebook[] }>(
        await getNotebooks(token),
      );
      if (!result.ok) {
        showErrorSnack(result.error ?? "Unknown error", {
          fromServer: result.fromServer,
        });
        return;
      }
      if (result.data.notebooks) {
        userNotebooks = Array.isArray(result.data.notebooks)
          ? result.data.notebooks
          : [];
      } else {
        userNotebooks = [];
      }
    } catch (err) {
      showErrorSnack(err instanceof Error ? err.message : String(err), {
        fromServer: false,
      });
    }
  };

  const addNoteHandler = () => {
    if (notebookId) push(`/notebook/${notebookId}/create-note`);
  };

  const deleteNotebookHandler = async () => {
    if (!navigator.onLine) {
      showErrorSnack("Please check your network and try again.", {
        fromServer: false,
      });
      return;
    }
    const token = get(authStore).token;
    if (!token || !notebookId) return;
    const result = unwrapResponse(await deleteNotebook(token, notebookId));
    if (!result.ok) {
      showErrorSnack(result.error ?? "Unknown error", {
        fromServer: result.fromServer,
      });
      return;
    }
    push("/notebooks");
  };

  const editNotesHandler = () => {
    editNotesMode = true;
    editNotesStore.set({ active: true, selectedCount: selectedNotes.length });
  };

  const cancelEditNotesHandler = () => {
    editNotesMode = false;
    selectedNotes = [];
    editNotesStore.set({ active: false, selectedCount: 0 });
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
    const result = unwrapResponse(await deleteNotes(token, selectedNotes));
    if (!result.ok) {
      showErrorSnack(result.error ?? "Unknown error", {
        fromServer: result.fromServer,
      });
      return;
    }
    cancelEditNotesHandler();
    if (notebookId) await loadNotes(notebookId);
  };

  const cancelEditNotebook = () => {
    editNotebookMode = false;
    notebookEditStore.update((s) => ({ ...s, editing: false }));
  };

  const saveEditNotebook = async (name: string, cover: string) => {
    const token = get(authStore).token;
    if (!token || !notebook) return;
    const { editNotebook } = await import("@/lib/api");
    const result = unwrapResponse<{ notebook_edited: Notebook }>(
      await editNotebook(
        token,
        notebook._id,
        name,
        cover,
        new Date().toISOString(),
      ),
    );
    if (!result.ok) {
      showErrorSnack(result.error ?? "Unknown error", {
        fromServer: result.fromServer,
      });
      return;
    }
    if (result.data.notebook_edited) {
      const nb = result.data.notebook_edited;
      notebook = nb;
      notebookEditStore.update((s) => ({
        ...s,
        edited: { ...nb, notebook_cover: getDisplayCover(nb.notebook_cover) },
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
    const result = unwrapResponse(
      await moveNotes(
        token,
        targetNotebookId,
        selectedNotes,
        latestUpdatedDate,
      ),
    );
    if (!result.ok) {
      showErrorSnack(result.error ?? "Unknown error", {
        fromServer: result.fromServer,
      });
      return;
    }
    if (result.ok) {
      showMoveDialog = false;
      cancelEditNotesHandler();
      if (notebookId) await loadNotes(notebookId);
    }
  };

  onDestroy(() => {
    editNotesStore.set({ active: false, selectedCount: 0 });
    notebookEditStore.update((s) => ({ ...s, editing: false }));
  });

  $effect(() => {
    if ($notebookEditStore?.editing) {
      editNotebookMode = true;
    }
  });

  const loadNotebookPage = async (nid: string) => {
    notesLoaded = false;
    notebookLoaded = false;
    loadError = null;
    const timeoutId = setTimeout(() => {
      if (!notebookLoaded || !notesLoaded) {
        loadError = "Connection timed out. Please check your network.";
        showErrorSnack(loadError, { fromServer: false });
        notebookLoaded = true;
        notesLoaded = true;
      }
    }, 8000);
    try {
      await authStore.getAuth();
      await Promise.all([loadNotebook(nid), loadNotes(nid), loadNotebooks()]);
    } catch (err) {
      loadError = err instanceof Error ? err.message : String(err);
      showErrorSnack(loadError, { fromServer: false });
      notesLoaded = true;
      notebookLoaded = true;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  onMount(() => {
    const fromParams = routeParams ?? get(paramsStore);
    let nid: string | null | undefined = fromParams?.notebookId;
    if (!nid) {
      const loc = get(location);
      if (loc) {
        const m = /\/notebook\/([^/]+)/.exec(loc);
        nid = m?.[1] ?? null;
      }
    }
    if (!nid) {
      const hash = window.location.hash || "";
      const m = /#?\/notebook\/([^/]+)/.exec(hash);
      nid = m?.[1] ?? null;
    }
    if (!nid) {
      loadError = "Unable to load content.";
      notebookLoaded = true;
      notesLoaded = true;
      return;
    }
    loadNotebookPage(nid);
  });
</script>

{#if !notebookLoaded || !notesLoaded}
  <div class="loading_routes">Loading...</div>
{:else if loadError || (!notebook && notes === null)}
  <div class="page_scrollable_header_breadcrumb_footer_list">
    <div class="loading_routes error-state">
      <p>Unable to load content.</p>
      <a href="/notebooks" use:link class="back-link">Back to Notebooks</a>
    </div>
  </div>
  <FooterView>
    <button class="btn-action-ghost" onclick={() => push("/notebooks")}>
      Back to Notebooks
    </button>
  </FooterView>
{:else}
  <div class="page_scrollable_header_breadcrumb_footer_list">
    {#if notebook && notes !== null}
      <NoteList
        notes={notes ?? []}
        onNotesSelected={handleNotesSelected}
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
        notebook={{
          notebook_name: notebook.notebook_name,
          notebook_cover: getDisplayCover(notebook.notebook_cover),
        }}
        onAddNotebook={async (name, cover) =>
          await saveEditNotebook(name, cover)}
        onCancel={cancelEditNotebook}
      />
    {/if}
  </div>
  <FooterView>
    <div class="nb-footer-row">
      {#if !editNotesMode && (notes ?? []).length > 0}
        <button class="btn-action-ghost" onclick={editNotesHandler}>
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            class="media_query_size"
          >
            <path
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
            />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Notes
        </button>
      {/if}
      {#if !editNotesMode}
        <button class="btn-action-primary" onclick={addNoteHandler}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            class="media_query_size"
          >
            <path
              d="M6 1v10M1 6h10"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          Add Note
        </button>
      {/if}
      {#if (notes ?? []).length < 1}
        <button class="btn-action-danger" onclick={deleteNotebookHandler}>
          <span class="icon_text">
            <span class="material-symbols-outlined button_icon danger"
              >delete</span
            >
            Delete Notebook
          </span>
        </button>
      {/if}
      {#if editNotesMode && selectedNotes.length > 0}
        <button class="btn-action-danger" onclick={deleteNotesHandler}>
          <span class="icon_text">
            <span
              class="material-symbols-outlined button_icon danger media_query_size"
              >delete</span
            >
            Delete
          </span>
        </button>
      {/if}
      {#if editNotesMode && selectedNotes.length > 0 && userNotebooks && userNotebooks.length > 1}
        <button class="btn-action-ghost" onclick={moveNoteFormHandler}>
          <span class="icon_text">
            <span
              class="material-symbols-outlined button_icon green symbol_size media_query_size"
              >flip_to_front</span
            >
            Move to…
          </span>
        </button>
      {/if}
      {#if editNotesMode}
        <button class="btn-action-ghost" onclick={cancelEditNotesHandler}>
          <span class="icon_text">
            <span
              class="material-symbols-outlined button_icon green media_query_size"
              >cancel</span
            >
            Cancel
          </span>
        </button>
      {/if}
    </div>
  </FooterView>
{/if}
