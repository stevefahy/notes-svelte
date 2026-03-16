<script lang="ts">
  import { fly } from "svelte/transition";
  import { cubicOut, cubicIn } from "svelte/easing";
  import APPLICATION_CONSTANTS from "@/lib/constants";
  import ErrorAlert from "@/components/UI/ErrorAlert.svelte";
  import { getDisplayCover } from "@/lib/notebookCoverUtils";
  import type { NotebookCoverType } from "@/lib/types";

  interface Props {
    method?: "create" | "edit";
    notebook?: { notebook_name: string; notebook_cover: NotebookCoverType };
    onAddNotebook?: (name: string, cover: string) => void | Promise<void>;
    onCancel: () => void;
  }
  let {
    method = "create",
    notebook,
    onAddNotebook,
    onCancel,
  }: Props = $props();

  const AC = APPLICATION_CONSTANTS;

  const covers: { value: NotebookCoverType; label: string }[] = [
    { value: "forest", label: "Forest" },
    { value: "emerald", label: "Emerald" },
    { value: "lime", label: "Lime" },
    { value: "sage", label: "Sage" },
  ];

  let selectedCover = $state<NotebookCoverType>("forest");
  let selectedName = $state("");

  $effect(() => {
    if (method === "edit" && notebook) {
      selectedCover = getDisplayCover(
        notebook.notebook_cover,
      ) as NotebookCoverType;
      selectedName = notebook.notebook_name;
    }
  });

  const originalName = $derived(
    method === "edit" && notebook ? notebook.notebook_name : "",
  );
  const originalCover = $derived(
    method === "edit" && notebook
      ? notebook.notebook_cover
      : ("forest" as NotebookCoverType),
  );

  const formChanged = $derived.by(() => {
    if (method === "create") {
      return (
        selectedName.length >= AC.NOTEBOOK_NAME_MIN &&
        selectedName.length <= AC.NOTEBOOK_NAME_MAX
      );
    }
    const hasChange =
      selectedName !== originalName || selectedCover !== originalCover;
    const nameValid =
      selectedName.length >= AC.NOTEBOOK_NAME_MIN &&
      selectedName.length <= AC.NOTEBOOK_NAME_MAX;
    return hasChange && nameValid;
  });

  const isConfirmDisabled = $derived(!formChanged);

  let error = $state({ error_state: false, message: "" });
  let isSubmitting = $state(false);

  const cancelHandler = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    error = { error_state: false, message: "" };
    onCancel();
  };

  const submitHandler = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (isConfirmDisabled || isSubmitting) return;
    error = { error_state: false, message: "" };

    if (!selectedName || selectedName.length < AC.NOTEBOOK_NAME_MIN) {
      error = { error_state: true, message: AC.NOTEBOOK_NAME_MIN_ERROR };
      return;
    }
    if (selectedName.length > AC.NOTEBOOK_NAME_MAX) {
      error = { error_state: true, message: AC.NOTEBOOK_NAME_MAX_ERROR };
      return;
    }
    const cover = selectedCover || "forest";
    isSubmitting = true;
    try {
      await onAddNotebook?.(selectedName, cover);
    } finally {
      isSubmitting = false;
    }
  };

  function focusNameInput(node: HTMLElement) {
    const input = node.querySelector<HTMLInputElement>("#new-notebook");
    if (input) input.focus();
    return {};
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
      e.preventDefault();
      cancelHandler(e);
    }
  }}
>
  <div
    class="bottom-sheet"
    role="dialog"
    aria-modal="true"
    aria-labelledby="add-notebook-title"
    tabindex="-1"
    use:focusNameInput
    in:fly={{ y: 400, duration: 380, easing: cubicOut }}
    out:fly={{ y: 400, duration: 300, easing: cubicIn }}
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.key === "Escape" && cancelHandler(e)}
  >
    <div class="sheet-handle"></div>

    <h2 id="add-notebook-title" class="sheet-title">
      {method === "edit" ? "Edit Notebook" : "New Notebook"}
    </h2>

    <form onsubmit={submitHandler}>
      <div class="sheet-field">
        <label class="form-label" for="new-notebook">Name</label>
        <input
          class="form-input"
          type="text"
          id="new-notebook"
          placeholder="e.g. Personal, Work…"
          bind:value={selectedName}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        />
      </div>

      <fieldset class="sheet-field sheet-fieldset">
        <legend class="form-label">Cover colour</legend>
        <div class="swatch-row">
          {#each covers as cover}
            <button
              type="button"
              class="swatch swatch-{cover.value}"
              class:selected={selectedCover === cover.value}
              disabled={isSubmitting}
              onclick={() => (selectedCover = cover.value)}
              aria-label="{cover.label} cover"
              aria-pressed={selectedCover === cover.value}
            ></button>
          {/each}
        </div>
      </fieldset>
    </form>

    {#if error.error_state}
      <div class="sheet-field">
        <ErrorAlert error_state={error.error_state} message={error.message} />
      </div>
    {/if}

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
        type="button"
        class="btn-create"
        disabled={isConfirmDisabled || isSubmitting}
        onclick={(e) => submitHandler(e)}
        aria-label={method === "edit"
          ? "Confirm edit button"
          : "Create notebook button"}
      >
        {#if isSubmitting}
          {method === "edit" ? "Saving…" : "Creating…"}
        {:else}
          {method === "edit" ? "Confirm" : "Create"}
        {/if}
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

  .sheet-fieldset {
    border: none;
    margin: 0;
  }

  .form-label {
    display: block;
    font-size: 11.5px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: var(--theme-text-secondary);
    margin-bottom: 6px;
  }

  .form-input {
    width: 100%;
    background: var(--theme-input-bg);
    border: 1.5px solid var(--theme-border-input);
    border-radius: var(--theme-radius-sm);
    padding: 11px 14px;
    font-family: var(--theme-font-sans);
    font-size: 14px;
    color: var(--theme-text);
    outline: none;
    box-sizing: border-box;
  }

  .form-input:focus {
    border-color: var(--theme-green);
    box-shadow: 0 0 0 3px rgba(46, 125, 82, 0.12);
  }

  .form-input:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .swatch-row {
    display: flex;
    gap: 10px;
    padding: 4px 0;
  }

  .swatch {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    transition: box-shadow 0.15s ease;
  }

  .swatch-forest {
    background: var(--notebook-forest);
  }
  .swatch-emerald {
    background: var(--notebook-emerald);
  }
  .swatch-lime {
    background: var(--notebook-lime);
  }
  .swatch-sage {
    background: var(--notebook-sage);
  }

  .swatch.selected {
    box-shadow:
      0 0 0 2.5px white,
      0 0 0 4.5px var(--theme-green);
  }

  .swatch:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

  .btn-create {
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

  .btn-create:hover:not(:disabled) {
    background: var(--theme-green-accent);
  }

  .btn-create:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
