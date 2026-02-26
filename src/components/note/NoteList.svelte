<script lang="ts">
  import { link } from "svelte-spa-router";
  // import { slide, fly } from 'svelte/transition';
  // import { backOut, quintOut } from 'svelte/easing';
  import DateFormat from "@/lib/dateFormat";
  import type { Note, SelectedNote } from "@/lib/types";
  import { extractNoteTitle, detectNoteTag } from "@/lib/noteCardUtils";
  import ViewNoteThumb from "./ViewNoteThumb.svelte";

  interface Props {
    notes: Note[];
    onNotesSelected?: (selected: SelectedNote) => void;
    onNotesEdit?: boolean;
    onClearNotesEdit?: boolean;
  }
  let {
    notes,
    onNotesSelected,
    onNotesEdit = false,
    onClearNotesEdit,
  }: Props = $props();

  let isChecked = $state<Record<string, boolean>>({});
  let prevClearNotesEdit = false;

  $effect(() => {
    const now = !!onClearNotesEdit;
    if (now && !prevClearNotesEdit) {
      isChecked = {};
      onNotesSelected?.({ selected: [] });
    }
    prevClearNotesEdit = now;
  });

  const updateCheckbox = (noteId: string, checked: boolean) => {
    isChecked = { ...isChecked, [noteId]: checked };
    const selected = Object.entries(isChecked)
      .filter(([, v]) => v)
      .map(([k]) => k);
    onNotesSelected?.({ selected });
  };

  const handleCardClick = (noteId: string) => {
    if (onNotesEdit) {
      updateCheckbox(noteId, !isChecked[noteId]);
    }
  };

  const handleCardKeydown = (noteId: string, e: KeyboardEvent) => {
    if (onNotesEdit && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      updateCheckbox(noteId, !isChecked[noteId]);
    }
  };
</script>

<div class="notes-list-container">
  <ul class="notes_list">
    {#each notes as note (note._id)}
      {@const title = extractNoteTitle(note.note)}
      {@const tag = detectNoteTag(note.note)}
      {@const selected = !!isChecked[note._id]}

      <li class="note-card-outer">
        {#if !onNotesEdit}
          <a
            href="/notebook/{note.notebook}/{note._id}"
            use:link
            class="note-card-link-overlay"
            aria-label="Open note"
          ></a>
        {/if}
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div
          class="note-card-link"
          role={onNotesEdit ? "button" : undefined}
          tabindex={onNotesEdit ? 0 : undefined}
          onclick={onNotesEdit ? () => handleCardClick(note._id) : undefined}
          onkeydown={onNotesEdit
            ? (e) => handleCardKeydown(note._id, e)
            : undefined}
        >
          <div class="note-card" class:note-card--selected={selected}>
            <div class="note-select-col-wrapper" class:is-visible={onNotesEdit}>
              <div
                class="note-select-col"
                role="checkbox"
                tabindex={onNotesEdit ? 0 : -1}
                aria-checked={selected}
                onclick={(e) => {
                  e.stopPropagation();
                  handleCardClick(note._id);
                }}
                onkeydown={(e) => handleCardKeydown(note._id, e)}
              >
                <div class="sel-circle" class:sel-circle--active={selected}>
                  {#if selected}
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 4l3 3 5-6"
                        stroke="white"
                        stroke-width="1.6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  {/if}
                </div>
              </div>
            </div>

            <div class="note-card-body">
              <div class="note-title">{title}</div>
              <div class="note-thumb-preview">
                <ViewNoteThumb text={note.note} />
              </div>
              <div class="note-foot">
                <span class="note-date">{DateFormat(note.updatedAt ?? "")}</span
                >
                {#if tag === "todo"}
                  <span class="note-tag tag-todo">Todo</span>
                {:else if tag === "table"}
                  <span class="note-tag tag-table">Table</span>
                {:else if tag === "code"}
                  <span class="note-tag tag-code">Code</span>
                {:else if tag === "image"}
                  <span class="note-tag tag-image">Image</span>
                {:else if tag === "list"}
                  <span class="note-tag tag-list">List</span>
                {:else if tag === "text"}
                  <span class="note-tag tag-text">Text</span>
                {:else if tag === "empty"}
                  <span class="note-tag tag-empty">Empty</span>
                {/if}
              </div>
            </div>
          </div>
        </div>
      </li>
    {/each}
  </ul>
</div>

<style>
  .note-card-link {
    display: block;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent; /* Clean up mobile taps */
  }

  .notes-list-container {
    background: var(--theme-bg);
    min-height: 100%;
    padding-bottom: 8px;
  }

  .edit-hint {
    padding: 6px 18px 2px;
    font-size: 11.5px;
    color: var(--theme-text-muted);
  }

  .notes_list {
    list-style: none;
    margin: 0;
    padding: 6px 14px 10px;
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .note-card-outer {
    position: relative;
  }

  .note-card-link-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    cursor: pointer;
  }

  .note-card-link {
    display: block;
    text-decoration: none;
    color: inherit;
  }

  .note-card {
    background: var(--theme-surface);
    border-radius: 14px;
    padding: 14px 14px 12px;
    border: 1px solid var(--theme-border);
    box-shadow: var(--theme-shadow-sm);
    display: flex;
    gap: 10px;
  }

  .note-card:hover {
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  }

  .note-card--selected {
    border-color: var(--theme-green);
    box-shadow: 0 0 0 2px var(--theme-lime-light);
  }

  /* Edit-mode checkbox column — platform-agnostic CSS transition */
  .note-select-col-wrapper {
    overflow: hidden;
    flex-shrink: 0;
    width: 0;
    transition: width 0.25s cubic-bezier(0.33, 1, 0.68, 1);
  }

  .note-select-col-wrapper.is-visible {
    width: 20px;
  }

  .note-select-col {
    flex-shrink: 0;
    margin-top: 1px;
    width: 20px;
    padding-top: 12px;
  }

  .sel-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1.5px solid #c0dcc8;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sel-circle--active {
    background: var(--theme-green);
    border-color: var(--theme-green);
  }

  /* Card body */
  .note-card-body {
    flex: 1;
    min-width: 0;

    padding: 12px; /* Standardize your internal spacing */
  }

  .note-title {
    font-family: var(--theme-font-lato);
    font-size: 15px;
    font-weight: 700;
    color: var(--theme-text-muted);
    margin-bottom: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: uppercase;
  }

  .note-thumb-preview {
    max-height: 80px;
    overflow: hidden;
    margin-bottom: 10px;
  }

  .note-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .note-date {
    font-size: 10.5px;
    color: var(--theme-text-muted);
  }

  /* Tag pills */
  .note-tag {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 99px;
  }

  .tag-todo {
    background: var(--theme-lime-bg);
    color: var(--theme-green-accent);
  }

  .tag-table {
    background: #f3f4f6;
    color: #6b7280;
  }

  .tag-code {
    background: #eff6ff;
    color: #1d4ed8;
  }

  .tag-image {
    background: #fdf4ff;
    color: #7e22ce;
  }

  .tag-list {
    background: #fff7ed;
    color: #c2410c;
  }

  .tag-text {
    background: #f8fafc;
    color: #94a3b8;
  }

  .tag-empty {
    background: #fafafa;
    color: #d1d5db;
  }
</style>
