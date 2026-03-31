<script lang="ts">
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { push, confirmNavigateAwayStore } from "@/lib/router";
  import { params as paramsStore } from "svelte-spa-router";
  import {
    initScrollSync,
    removeScrollSync,
    detachScrollSyncListeners,
    alignNotePanesScroll,
    captureSplitEnterScrollSnap,
    stabilizeSplitEnterScroll,
    type SplitEnterScrollSnap,
  } from "@/lib/scroll_sync";
  import {
    commitNoteShellTransition,
    getNoteShellEditViewTransitionCleanupMs,
    getNoteShellSplitTransitionCleanupMs,
    type NoteShellLayout,
  } from "@/lib/noteShellDom";
  import { attachNoteShellSwipeNavigation } from "@/lib/noteShellSwipeNavigation";
  import { authStore } from "@/stores/auth";
  import { getDisplayCover } from "@/lib/notebookCoverUtils";
  import { notebookEditStore } from "@/stores/notebookEdit";
  import {
    createNote,
    getNote,
    getNotebook,
    saveNote,
    unwrapResponse,
  } from "@/lib/api";
  import APPLICATION_CONSTANTS from "@/lib/constants";
  import { showErrorSnack, showSnack } from "@/stores/snack";
  import type { Note, Notebook } from "@/lib/types";
  import FooterView from "@/components/layout/FooterView.svelte";
  import ViewNote from "@/components/note/ViewNote.svelte";
  import EditNote from "@/components/note/EditNote.svelte";
  import type { NotePageProps } from "@/lib/types";
  import { link } from "svelte-spa-router";

  const AC = APPLICATION_CONSTANTS;

  let { params: routeParams }: NotePageProps = $props();

  const notebookId = $derived.by(() => {
    const fromParams = (routeParams ?? $paramsStore)?.notebookId;
    if (fromParams) return fromParams;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const m = /#?\/notebook\/([^/]+)\/([^/]+)/.exec(hash);
    return m?.[1] ?? null;
  });
  const noteId = $derived.by(() => {
    const fromParams = (routeParams ?? $paramsStore)?.noteId;
    if (fromParams) return fromParams;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const m = /#?\/notebook\/([^/]+)\/([^/]+)/.exec(hash);
    return m?.[2] ?? null;
  });

  let note = $state<Note | null>(null);
  let notebook = $state<Notebook | null>(null);
  let viewText = $state("");
  let originalText = $state("");
  let noteLoaded = $state(false);
  let loadError = $state<string | null>(null);
  let isViewMode = $state(true);
  let isSplitScreen = $state(false);
  let isMobile = $state(false);
  let viewContainerEl = $state<HTMLDivElement | undefined>(undefined);
  const isCreate = $derived(noteId === "create-note");

  const showEditPane = $derived(isViewMode || isSplitScreen);

  const noteShellLayout = $derived<NoteShellLayout>(
    isSplitScreen ? "split" : isViewMode ? "view" : "edit",
  );

  let prevIsSplitRef = false;
  let splitEnterFromRef: "edit" | "view" | null = null;
  let prevNoteShellLayoutRef: NoteShellLayout | null = null;
  let splitPostAlignTimeoutRef: ReturnType<typeof setTimeout> | null = null;
  let splitEnterSnapRef: SplitEnterScrollSnap | null = null;
  let splitStabilizeCleanupRef: (() => void) | null = null;
  let prevIsSplitForScrollRef = false;
  let prevNoteShellLayoutScrollRef: NoteShellLayout | null = null;

  const loadNotebook = async () => {
    const token = get(authStore).token;
    if (!token || !notebookId) {
      if (!notebookId) loadError = "Invalid route.";
      noteLoaded = true;
      return;
    }
    const result = unwrapResponse<{ notebook: Notebook }>(
      await getNotebook(token, notebookId),
    );
    if (!result.ok) {
      loadError = result.error ?? "Unknown error";
      showErrorSnack(loadError, { fromServer: result.fromServer });
      noteLoaded = true;
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
  };

  const loadNote = async () => {
    if (noteId === "create-note") {
      viewText = "";
      noteLoaded = true;
      return;
    }
    const token = get(authStore).token;
    if (!token || !notebookId || !noteId) {
      if (!notebookId || !noteId) loadError = "Invalid route.";
      noteLoaded = true;
      return;
    }
    const result = unwrapResponse<{ note: Note }>(
      await getNote(token, notebookId, noteId),
    );
    if (!result.ok) {
      loadError = result.error ?? "Unknown error";
      showErrorSnack(loadError, { fromServer: result.fromServer });
      noteLoaded = true;
      return;
    }
    if (result.data.note) {
      note = result.data.note;
      viewText = result.data.note.note;
      originalText = result.data.note.note;
      noteLoaded = true;
    }
  };

  const isChanged = $derived(viewText !== originalText);

  const handleCreateNote = async (noteContent: string) => {
    const token = get(authStore).token;
    if (!token || !notebookId) return;
    const result = unwrapResponse(
      await createNote(token, { notebookId, note: noteContent }),
    );
    if (!result.ok) {
      showErrorSnack(result.error ?? "Unknown error", {
        fromServer: result.fromServer,
      });
      return;
    }
    push(`/notebook/${notebookId}`);
  };

  const handleSaveNote = async (noteContent: string) => {
    const token = get(authStore).token;
    if (!token || !notebookId || !noteId || noteId === "create-note") return;
    const result = unwrapResponse(
      await saveNote(token, notebookId, noteId, noteContent),
    );
    if (!result.ok) {
      showErrorSnack(result.error ?? "Unknown error", {
        fromServer: result.fromServer,
      });
      return;
    }
    originalText = noteContent;
    showSnack({ message: "Note Saved" });
  };

  const handleViewTextUpdate = (text: string) => {
    viewText = text;
  };

  /**
   * Called before leaving the note route when there are unsaved edits.
   * Saves if changed and shows "Note Saved" on success (matches Angular canDeactivateGuard).
   */
  const confirmNavigateAway = async () => {
    if (!isChanged || isCreate) return;
    const token = get(authStore).token;
    if (!token || !notebookId || !noteId || noteId === "create-note") return;
    await handleSaveNote(viewText);
  };

  const toggleViewEdit = async () => {
    if (isChanged) await handleSaveNote(viewText);
    isViewMode = !isViewMode;
  };

  const toggleSplitScreen = () => {
    if (!isSplitScreen) {
      splitEnterSnapRef = captureSplitEnterScrollSnap(isViewMode);
    } else {
      splitEnterSnapRef = null;
    }
    isSplitScreen = !isSplitScreen;
  };

  const loadExampleNote = async () => {
    if (!isMobile) {
      splitEnterSnapRef = captureSplitEnterScrollSnap(isViewMode);
      isSplitScreen = true;
    }
    try {
      const res = await fetch("/markdown/welcome_markdown.md");
      if (res.ok) viewText = await res.text();
      else viewText = "# Example Note\n\nStart typing your note here...";
    } catch {
      viewText = "# Example Note\n\nStart typing your note here...";
    }
  };

  const checkMobile = () => {
    isMobile = window.innerWidth < AC.SPLITSCREEN_MINIMUM_WIDTH;
    if (isMobile) isSplitScreen = false;
  };

  $effect(() => {
    if (!noteLoaded) return;
    if (!prevIsSplitRef && isSplitScreen) {
      splitEnterFromRef = isViewMode ? "view" : "edit";
    }
    prevIsSplitRef = isSplitScreen;
  });

  $effect(() => {
    if (!noteLoaded) return;
    const el = viewContainerEl ?? null;
    const prev = prevNoteShellLayoutRef;
    if (prev !== null && prev !== noteShellLayout) {
      commitNoteShellTransition(el, prev, noteShellLayout);
    }
    prevNoteShellLayoutRef = noteShellLayout;
  });

  $effect(() => {
    if (!noteLoaded) return;

    const prevLayout = prevNoteShellLayoutScrollRef;
    const editViewTransition =
      prevLayout !== null &&
      ((prevLayout === "edit" && noteShellLayout === "view") ||
        (prevLayout === "view" && noteShellLayout === "edit"));

    const wasSplit = prevIsSplitForScrollRef;
    const leavingSplit = wasSplit && !isSplitScreen;
    const enteringSplit = !wasSplit && isSplitScreen;
    prevIsSplitForScrollRef = isSplitScreen;

    if (leavingSplit || enteringSplit || editViewTransition) {
      detachScrollSyncListeners();
    }

    if (splitPostAlignTimeoutRef !== null) {
      window.clearTimeout(splitPostAlignTimeoutRef);
      splitPostAlignTimeoutRef = null;
    }
    splitStabilizeCleanupRef?.();
    splitStabilizeCleanupRef = null;

    let raf1 = 0;
    let raf2 = 0;
    const splitFrom = splitEnterFromRef;
    const snapCaptured = splitEnterSnapRef;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (!isSplitScreen) {
          if (leavingSplit) {
            const exitSettleMs = getNoteShellSplitTransitionCleanupMs() + 120;
            splitPostAlignTimeoutRef = window.setTimeout(() => {
              splitPostAlignTimeoutRef = null;
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  splitEnterFromRef = null;
                  initScrollSync();
                });
              });
            }, exitSettleMs);
            return;
          }
          if (editViewTransition) {
            const settleMs = getNoteShellEditViewTransitionCleanupMs() + 120;
            splitPostAlignTimeoutRef = window.setTimeout(() => {
              splitPostAlignTimeoutRef = null;
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  alignNotePanesScroll(noteShellLayout, null);
                  splitEnterFromRef = null;
                  initScrollSync();
                });
              });
            }, settleMs);
            return;
          }
          alignNotePanesScroll(noteShellLayout, null);
          splitEnterFromRef = null;
          initScrollSync();
          return;
        }

        const splitEnterWithOrigin = splitFrom !== null;
        if (splitEnterWithOrigin) {
          splitEnterFromRef = null;
        }

        if (splitEnterWithOrigin && snapCaptured) {
          splitEnterSnapRef = null;
          const splitStabilizeMs = getNoteShellSplitTransitionCleanupMs() + 120;
          splitStabilizeCleanupRef = stabilizeSplitEnterScroll(
            snapCaptured,
            splitStabilizeMs,
            () => {
              splitStabilizeCleanupRef = null;
              initScrollSync();
            },
          );
          return;
        }

        if (splitEnterWithOrigin) {
          splitPostAlignTimeoutRef = window.setTimeout(() => {
            splitPostAlignTimeoutRef = null;
            alignNotePanesScroll("split", splitFrom);
            initScrollSync();
          }, getNoteShellSplitTransitionCleanupMs());
          return;
        }

        alignNotePanesScroll("split", null);
        initScrollSync();
      });
    });

    prevNoteShellLayoutScrollRef = noteShellLayout;

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (splitPostAlignTimeoutRef !== null) {
        window.clearTimeout(splitPostAlignTimeoutRef);
        splitPostAlignTimeoutRef = null;
      }
      splitStabilizeCleanupRef?.();
      splitStabilizeCleanupRef = null;
    };
  });

  $effect(() => {
    if (!noteLoaded || !viewContainerEl) return;
    return attachNoteShellSwipeNavigation(
      viewContainerEl,
      () => noteShellLayout,
      () => {
        if (!isViewMode) void toggleViewEdit();
      },
      () => {
        if (isViewMode) void toggleViewEdit();
      },
    );
  });

  $effect(() => {
    if (!noteLoaded) return;
    const t = setTimeout(() => initScrollSync(), 500);
    return () => {
      clearTimeout(t);
      removeScrollSync();
    };
  });

  onMount(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    confirmNavigateAwayStore.set(confirmNavigateAway);
    (async () => {
      await authStore.getAuth();
      await loadNotebook();
      if (loadError) return;
      await loadNote();
      // View mode for existing notes, Edit mode for create-note (matching Vue)
      isViewMode = noteId !== "create-note";
    })();
    return () => {
      window.removeEventListener("resize", checkMobile);
      confirmNavigateAwayStore.set(null);
    };
  });
</script>

{#if !noteLoaded}
  <div class="loading_routes">Loading...</div>
{:else if loadError}
  <div class="page_scrollable_header_breadcrumb_footer">
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
  <div class="page_scrollable_header_breadcrumb_footer">
    <div
      bind:this={viewContainerEl}
      class="view_container {isSplitScreen ? 'editnote_box_split' : ''}"
      id="view_container"
      data-note-layout={noteShellLayout}
    >
      <EditNote
        loadedText={viewText}
        onUpdate={(t) => handleViewTextUpdate(t)}
        visible={showEditPane}
        splitScreen={isSplitScreen}
      />

      <ViewNote {viewText} onEdit={(t) => handleViewTextUpdate(t)} />
    </div>
  </div>
  <FooterView>
    <div class="nb-footer-row">
      {#if isCreate && viewText.length === 0}
        <button
          class="btn-action-ghost"
          type="button"
          onclick={loadExampleNote}
        >
          <span class="material-symbols-outlined" aria-hidden="true">egg</span>
          Example
        </button>
      {/if}
      {#if isCreate && viewText.length > 0}
        <button
          class="btn-action-primary"
          onclick={() => handleCreateNote(viewText)}
          type="button"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 1v10M1 6h10"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          Create Note
        </button>
      {/if}
      {#if !isCreate && isChanged}
        <button
          class="btn-action-primary"
          onclick={() => handleSaveNote(viewText)}
          type="button"
        >
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
          >
            <path
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
            />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Save Note
        </button>
      {/if}
      {#if !isSplitScreen}
        <button
          class="btn-action-ghost"
          onclick={toggleViewEdit}
          type="button"
          aria-label={isViewMode ? "Switch to Edit" : "Switch to View"}
        >
          {#if isViewMode}
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
            >
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              />
            </svg>
            Edit
          {:else}
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
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            View
          {/if}
        </button>
      {/if}
      {#if !isMobile}
        <button
          class="btn-action-ghost"
          onclick={toggleSplitScreen}
          type="button"
          aria-label="Toggle split screen"
        >
          {#if isSplitScreen}
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
            >
              <rect x="6" y="2" width="12" height="20" rx="2" />
            </svg>
          {:else}
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
            >
              <rect x="2" y="2" width="8" height="20" rx="2" />
              <rect x="14" y="2" width="8" height="20" rx="2" />
            </svg>
          {/if}
          Split Screen
        </button>
      {/if}
    </div>
  </FooterView>
{/if}
