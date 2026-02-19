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
    <button
      class="btn-footer btn-contained v-btn v-btn--elevated v-theme--myCustomLightTheme bg-secondary v-btn--density-default rounded-xl v-btn--size-default v-btn--variant-elevated contained medium button_fab"
      onclick={() => (enableAddNotebook = true)}
      aria-label="Add notebook button"
      type="button"
    >
      <span class="icon_text">
        <span class="material-symbols-outlined button_icon white">
          add_circle
        </span>
        Add Notebook
      </span>
    </button>
  {/if}
</FooterView>

<style>
  @import url("../../assets/styles/notebook-list-shared.scss");
</style>
