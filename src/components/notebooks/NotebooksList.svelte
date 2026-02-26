<script lang="ts">
  import { get } from "svelte/store";
  import { authStore } from "@/stores/auth";
  import { showErrorNotification } from "@/stores/notification";
  import { addNotebook, unwrapResponse } from "@/lib/api";
  import type { Notebook } from "@/lib/types";
  import NotebookListItem from "./NotebookListItem.svelte";
  import FooterView from "@/components/layout/FooterView.svelte";
  import AddNotebookForm from "./AddNotebookForm.svelte";

  interface Props {
    error?: string;
    success?: boolean;
    notebooks: Notebook[];
    onNotebooksReload?: () => void | Promise<void>;
  }
  let { error, success, notebooks, onNotebooksReload }: Props = $props();

  let enableAddNotebook = $state(false);
  const localNotebooks = $derived(notebooks || []);

  const addNotebookHandler = async (
    notebook_name: string,
    notebook_cover: string,
  ) => {
    const token = get(authStore).token;
    if (!token) return;
    const result = unwrapResponse(
      await addNotebook(token, notebook_name, notebook_cover),
    );
    if (!result.ok) {
      showErrorNotification(result.error ?? "Unknown error");
      return;
    }
    enableAddNotebook = false;
    await onNotebooksReload?.();
  };

  const cancelHandler = () => {
    enableAddNotebook = false;
  };
</script>

{#if localNotebooks.length > 0 || enableAddNotebook}
  <ul class="notebooks_list">
    {#each localNotebooks as notebook (notebook._id)}
      <NotebookListItem notebook_item={notebook} />
    {/each}
  </ul>
  {#if enableAddNotebook}
    <AddNotebookForm
      method="create"
      onAddNotebook={addNotebookHandler}
      onCancel={cancelHandler}
    />
  {/if}
{/if}

<FooterView>
  {#if localNotebooks.length > 0 || enableAddNotebook}
    <div class="fab-row">
      <button
        class="fab"
        onclick={() => (enableAddNotebook = true)}
        aria-label="New notebook button"
        type="button"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 1v10M1 6h10"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
          ></path>
        </svg>
        New Notebook
      </button>
    </div>
  {/if}
</FooterView>

<style>
  @import url("../../assets/styles/notebook-list-shared.scss");

  .fab {
    background: var(--theme-green);
    color: white;
    border: none;
    border-radius: var(--theme-radius-sm);
    padding: 12px 22px;
    font-family: var(--theme-font-sans);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 7px;
    box-shadow: 0 4px 18px rgba(46, 125, 82, 0.38);
  }

  .fab:hover {
    background: var(--theme-green-accent);
  }

  .fab-row {
    width: 100%;
    display: flex;
    justify-content: center;
  }
</style>
