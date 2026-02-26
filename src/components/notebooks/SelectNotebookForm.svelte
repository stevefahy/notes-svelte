<script lang="ts">
  import { fly } from "svelte/transition";
  import { cubicOut, cubicIn } from "svelte/easing";
  import { getDisplayCover } from "@/lib/notebookCoverUtils";
  import type { Notebook } from "@/lib/types";

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
    const firstOption = node.querySelector<HTMLButtonElement>(".notebook-option");
    if (firstOption) firstOption.focus();
    return {};
  }

  function handleOptionsKeydown(e: KeyboardEvent) {
    const options = Array.from(
      (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>(
        ".notebook-option",
      ),
    );
    const current = options.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown" && current < options.length - 1) {
      e.preventDefault();
      options[current + 1].focus();
    } else if (e.key === "ArrowUp" && current > 0) {
      e.preventDefault();
      options[current - 1].focus();
    }
  }
</script>

<div
  class="sheet-overlay"
  role="button"
  tabindex="0"
  aria-label="Close dialog"
  onclick={(e) => cancelHandler(e)}
  onkeydown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      if (e.target instanceof HTMLElement && e.target.closest(".bottom-sheet")) {
        return;
      }
      e.preventDefault();
      cancelHandler(e);
    }
  }}
>
  <div
    class="bottom-sheet"
    role="dialog"
    aria-modal="true"
    aria-labelledby="move-notebook-title"
    tabindex="-1"
    use:focusDialog
    in:fly={{ y: 400, duration: 380, easing: cubicOut }}
    out:fly={{ y: 400, duration: 300, easing: cubicIn }}
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.key === "Escape" && cancelHandler(e)}
  >
    <div class="sheet-handle"></div>

    <h2 id="move-notebook-title" class="sheet-title">Move to Notebook</h2>

    <form id="move-notebook-form" onsubmit={submitHandler}>
      <div class="sheet-field">
        <span class="form-label" id="notebook-options-label">Notebook</span>
        <div
          class="notebook-options"
          role="listbox"
          tabindex="-1"
          aria-labelledby="notebook-options-label"
          onkeydown={handleOptionsKeydown}
        >
          {#each notebooksFiltered as nb (nb._id)}
            <button
              type="button"
              class="notebook-option"
              class:selected={selectedNotebook === nb._id}
              id={"option-" + nb._id}
              role="option"
              aria-selected={selectedNotebook === nb._id}
              onclick={() => (selectedNotebook = nb._id)}
            >
              <span
                class="option-cover option-cover-{getDisplayCover(nb.notebook_cover)}"
              >
                <span class="nb-spine nb-spine-{getDisplayCover(nb.notebook_cover)}"></span>
              </span>
              <span class="option-name">{nb.notebook_name}</span>
            </button>
          {/each}
        </div>
      </div>
    </form>

    <div class="sheet-actions">
      <button
        type="button"
        class="btn-cancel"
        onclick={cancelHandler}
        aria-label="Cancel button"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="move-notebook-form"
        class="btn-move"
        disabled={!formIsValid}
        aria-label="Move Note button"
      >
        Move Note
      </button>
    </div>
  </div>
</div>

<style>
  .sheet-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(8, 18, 12, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .bottom-sheet {
    background: var(--theme-surface);
    border-radius: 22px 22px 0 0;
    padding: 8px 0 32px;
    width: 100%;
    outline: none;
    box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.12);
  }

  @media (min-width: 768px) {
    .bottom-sheet {
      max-width: 420px;
      border-radius: 22px 22px 0 0;
    }
  }

  .sheet-handle {
    width: 36px;
    height: 4px;
    background: var(--theme-border-input);
    border-radius: 2px;
    margin: 8px auto 20px;
  }

  .sheet-title {
    font-family: var(--theme-font-serif);
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text);
    padding: 0 20px;
    margin: 0 0 18px;
  }

  .sheet-field {
    padding: 0 20px;
    margin-bottom: 14px;
  }

  .form-label {
    display: block;
    font-size: 11.5px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: var(--theme-text-secondary);
    margin-bottom: 6px;
  }

  .notebook-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
    padding: 4px 0;
  }

  .notebook-option {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 12px;
    background: var(--theme-input-bg);
    border: 1.5px solid var(--theme-border-input);
    border-radius: var(--theme-radius-sm);
    font-family: var(--theme-font-sans);
    font-size: 14px;
    color: var(--theme-text);
    text-align: left;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .notebook-option:hover {
    border-color: var(--theme-green);
  }

  .notebook-option.selected {
    border-color: var(--theme-green);
    box-shadow: 0 0 0 2px rgba(46, 125, 82, 0.2);
  }

  .notebook-option:focus {
    outline: none;
    border-color: var(--theme-green);
    box-shadow: 0 0 0 3px rgba(46, 125, 82, 0.12);
  }

  .option-cover {
    width: 24px;
    height: 28px;
    border-radius: 6px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }

  .option-cover-forest {
    background: var(--notebook-forest);
  }

  .option-cover-emerald {
    background: var(--notebook-emerald);
  }

  .option-cover-lime {
    background: var(--notebook-lime);
  }

  .option-cover-sage {
    background: var(--notebook-sage);
  }

  .nb-spine {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
  }

  .nb-spine-forest {
    background: var(--notebook-emerald-color);
  }

  .nb-spine-emerald {
    background: var(--notebook-lime-color);
  }

  .nb-spine-lime {
    background: var(--notebook-sage-color);
  }

  .nb-spine-sage {
    background: var(--notebook-forest-color);
  }

  .option-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sheet-actions {
    display: flex;
    gap: 10px;
    padding: 6px 20px 0;
    margin-top: 4px;
  }

  .btn-cancel {
    flex: 1;
    background: var(--theme-bg);
    color: var(--theme-text);
    border: 1px solid var(--theme-border-input);
    border-radius: var(--theme-radius-sm);
    padding: 13px;
    font-family: var(--theme-font-sans);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-cancel:hover {
    background: #e8f4ec;
  }

  .btn-move {
    flex: 1;
    background: var(--theme-green);
    color: white;
    border: none;
    border-radius: var(--theme-radius-sm);
    padding: 13px;
    font-family: var(--theme-font-sans);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: var(--theme-shadow-btn);
  }

  .btn-move:hover:not(:disabled) {
    background: var(--theme-green-accent);
  }

  .btn-move:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
