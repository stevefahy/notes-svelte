<script lang="ts">
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { authStore } from "@/stores/auth";
  import { notificationStore } from "@/stores/notification";
  import { getNotebooks } from "@/lib/api";
  import type { GetNotebooks, Notebook } from "@/lib/types";
  import LoadingScreen from "@/components/UI/LoadingScreen.svelte";
  import NotebooksList from "@/components/notebooks/NotebooksList.svelte";

  let notebooksLoaded = $state(false);
  let userNotebooks = $state<GetNotebooks>({ success: false, notebooks: [] });

  const showNotification = (msg: string) => {
    notificationStore.ShowNotification({
      notification: { n_status: "error", title: "Error!", message: msg },
    });
  };

  const filterNotebooks = (notebooks: Notebook[]) => {
    if (!notebooks || notebooks.length === 0) return notebooks;
    const sorted = [...notebooks].map((x) => ({
      ...x,
      updatedAt:
        x.updatedAt === "No date" || !x.updatedAt
          ? "December 17, 1995 03:24:00"
          : x.updatedAt,
    }));
    sorted.sort((a, b) =>
      new Date(a.updatedAt!) > new Date(b.updatedAt!) ? 1 : -1,
    );
    return sorted.reverse();
  };

  const loadNotebooks = async () => {
    const ctx = get(authStore);
    const token = ctx.token;
    if (!token) return;
    try {
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
        userNotebooks = {
          success: true,
          notebooks: filterNotebooks(response.notebooks),
        };
        notebooksLoaded = true;
      }
    } catch (err) {
      showNotification(String(err));
    }
  };

  onMount(async () => {
    await authStore.getAuth();
    await loadNotebooks();
  });
</script>

{#if !notebooksLoaded}
  <LoadingScreen />
{:else}
  <div class="page_scrollable_header_breadcrumb_footer_list">
    <NotebooksList
      error={userNotebooks && "error" in userNotebooks
        ? userNotebooks.error
        : undefined}
      success={userNotebooks && "success" in userNotebooks
        ? userNotebooks.success
        : false}
      notebooks={userNotebooks && "notebooks" in userNotebooks
        ? (userNotebooks.notebooks ?? [])
        : []}
      onNotebooksReload={loadNotebooks}
    />
  </div>
{/if}
