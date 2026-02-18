<script lang="ts">
  import type { Notebook } from "@/lib/types";
  import { vCard, vCardText } from "@/lib/vuetify-classes";

  interface Props {
    notebooks: Notebook[];
    currentNotebookId: string | null;
    onMoveNotes: (notebookId: string) => void | Promise<void>;
    onCancel: () => void;
  }
  let { notebooks, currentNotebookId, onMoveNotes, onCancel }: Props = $props();

  let selectedNotebook = $state("");
  let formIsValid = $derived(
    selectedNotebook !== "" && selectedNotebook !== "default",
  );

  const notebooksSorted = $derived.by(() => {
    const copy = [...notebooks];
    copy.sort((a, b) => {
      const aDate =
        a.updatedAt === "No date" || !a.updatedAt
          ? "December 17, 1995"
          : a.updatedAt;
      const bDate =
        b.updatedAt === "No date" || !b.updatedAt
          ? "December 17, 1995"
          : b.updatedAt;
      return new Date(aDate) > new Date(bDate) ? -1 : 1;
    });
    return copy;
  });

  const notebooksFiltered = $derived(
    notebooksSorted.filter((n) => n._id !== currentNotebookId),
  );

  const cancelHandler = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  };

  const submitHandler = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedNotebook || !formIsValid) return;
    await onMoveNotes(selectedNotebook);
  };

  function focusDialog(node: HTMLElement) {
    node.focus();
    return {};
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
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        cancelHandler(e);
      }
    }}
  ></div>
  <div
    class={vCard("card", "modal-dialog", "dialogue_container")}
    role="dialog"
    aria-modal="true"
    aria-labelledby="move-notebook-title"
    tabindex="-1"
    use:focusDialog
    onkeydown={(e) => e.key === "Escape" && cancelHandler(e)}
  >
    <div class={vCardText()}>
      <h2 id="move-notebook-title" class="dialogue-title">Move to Notebook</h2>
      <form id="move-notebook-form" onsubmit={submitHandler} class="form">
        <div class="control">
          <label for="notebooks-select">Name</label>
          <select
            id="notebooks-select"
            class="select_dialogue"
            bind:value={selectedNotebook}
          >
            <option value="" disabled>Select a notebook...</option>
            {#each notebooksFiltered as nb (nb._id)}
              <option value={nb._id}>{nb.notebook_name}</option>
            {/each}
          </select>
        </div>
      </form>
      <div class="button_row">
        <div class="action">
          <div class="move">
            <button
              type="submit"
              form="move-notebook-form"
              class="btn-contained v-btn--size-default"
              disabled={!formIsValid}
              aria-label="Move Note button"
            >
              Move Note
            </button>
          </div>
          <div class="cancel">
            <button
              type="button"
              class="btn-contained v-btn--size-default"
              onclick={cancelHandler}
              aria-label="Cancel button"
            >
              <span class="icon_text">
                <span class="material-symbols-outlined button_icon white"
                  >cancel</span
                >
                Cancel
              </span>
            </button>
          </div>
        </div>
      </div>
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
    justify-content: space-between;
  }

  .control label {
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #353336;
    display: block;
  }

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
    width: 100%;
    display: flex;
    justify-content: space-between;
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

  .icon_text {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .button_icon.white {
    color: white;
  }

  .btn-contained:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
</style>
