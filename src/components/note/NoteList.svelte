<script lang="ts">
  import { link } from "svelte-spa-router";
  import ViewNoteThumb from "./ViewNoteThumb.svelte";
  import DateFormat from "@/lib/dateFormat";
  import type { Note, SelectedNote } from "@/lib/types";
  import { vCard, vCardText } from "@/lib/vuetify-classes";

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

  const handleCheckboxChange = (noteId: string, e: Event) => {
    e.stopPropagation();
    const target = e.target as HTMLInputElement;
    updateCheckbox(noteId, target.checked);
  };
</script>

<ul class="notes_list">
  {#each notes as note (note._id)}
    <li class="notebook_list_bg">
      <div class="thumb_outer">
        <a
          href="/notebook/{note.notebook}/{note._id}"
          use:link
          class="thumb_outer_link"
          onclick={(e) => onNotesEdit && e.preventDefault()}
        >
          <div
            class="edit_link"
            role="button"
            tabindex={onNotesEdit ? 0 : -1}
            onclick={(e) => {
              if (onNotesEdit) {
                e.preventDefault();
                updateCheckbox(note._id, !isChecked[note._id]);
              }
            }}
            onkeydown={(e) => {
              if (onNotesEdit && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                updateCheckbox(note._id, !isChecked[note._id]);
              }
            }}
          >
            <div class={vCard("note_list_card")}>
              <div class={vCardText("cardcontent")}>
                <div class="thumb_image">
                  <ViewNoteThumb text={note.note} />
                </div>
                <div class="date_format date_format_notes">
                  {DateFormat(note.updatedAt ?? "")}
                </div>
              </div>
            </div>
          </div>
        </a>
        {#if onNotesEdit}
          <div class="thumb_select_outer">
            <div class="thumb_select">
              <input
                type="checkbox"
                name="Status"
                value={note._id}
                id="input_{note._id}"
                checked={isChecked[note._id] ?? false}
                onchange={(e) => handleCheckboxChange(note._id, e)}
                onclick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        {/if}
      </div>
    </li>
  {/each}
</ul>

<style>
  .cardcontent {
    padding: 0 16px !important;
  }

  .notes_list {
    list-style: none;
    margin-block-start: 0em;
    padding-inline-start: 0px;
    padding-left: 10px;
    padding-right: 10px;
    margin-bottom: 16px;
  }

  .notes_list li {
    padding-top: 10px;
  }

  .notebook_list_bg {
    position: relative;
  }

  .thumb_select {
    position: absolute;
    right: 10px;
    top: 15px;
    z-index: 1000;
  }

  .thumb_select_outer {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .note_list_card:hover {
    background-color: #f7f7f7;
  }

  .thumb_image {
    min-height: calc(var(--viewnotethumb-box-min-height) * 1px);
    min-height: 45px;
    max-height: 300px;
    overflow-y: hidden;
    width: 100%;
    padding: 0;
    margin: 0;
  }

  .thumb_outer_link {
    cursor: pointer;
    width: 100%;
  }

  .thumb_outer {
    display: flex;
    width: 100%;
    flex-direction: row;
    align-items: flex-start;
    min-height: 81px;
  }

  .thumb_outer a {
    width: 100%;
  }

  .thumb_outer .edit_link {
    width: 100%;
  }
</style>
