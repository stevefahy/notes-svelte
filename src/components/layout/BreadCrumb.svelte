<script lang="ts">
  import { link } from "svelte-spa-router";
  import { location } from "svelte-spa-router";
  import { notebookEditStore } from "@/stores/notebookEdit";
  import type { PageType, NotebookType, NotebookCoverType } from "@/lib/types";
  import NotebooksLink from "./NotebooksLink.svelte";
  import NotebooksNolink from "./NotebooksNolink.svelte";

  let pageLayout = $state<PageType>("other");
  let notebook = $state<NotebookType>({ name: "", cover: "sage", id: "" });

  const currentLocation = $derived($location);

  $effect(() => {
    // Use $location; fallback to window.location.hash (available before router store updates, e.g. on refresh)
    let loc = $location;
    if (!loc && typeof window !== "undefined") {
      const hash = window.location.hash || "";
      loc = hash.replace(/^#?/, "") || "/";
    }
    if (loc) {
      if (loc.startsWith("/profile")) pageLayout = "profile";
      else if (loc.startsWith("/notebooks") && !loc.includes("/notebook/"))
        pageLayout = "notebooks";
      else if (loc.match(/^\/notebook\/[^/]+$/)) pageLayout = "notebook";
      else if (loc.match(/^\/notebook\/[^/]+\/[^/]+$/)) pageLayout = "note";
      else pageLayout = "other";
    }
  });

  $effect(() => {
    const storeVal = $notebookEditStore;
    if (storeVal?.edited) {
      const edited = storeVal.edited;
      if (edited?.notebook_name && edited?._id) {
        notebook = {
          id: edited._id,
          name: edited.notebook_name,
          cover: edited.notebook_cover as NotebookCoverType,
        };
      }
    }
  });

  $effect(() => {
    if (pageLayout === "notebooks") {
      notebook = { name: "", cover: "sage", id: "" };
    }
  });

  const editNotebook = () => {
    notebookEditStore.update((s) => ({ ...s, editing: true }));
  };
</script>

{#if pageLayout !== "other"}
  <div>
    <div
      role="presentation"
      class="breadcrumb_container"
      class:breadcrumb--notebooks={pageLayout === "notebooks"}
      class:breadcrumb--section={pageLayout === "notebooks" ||
        pageLayout === "profile"}
    >
      <div class="breadcrumbs_inner">
        {#if pageLayout === "profile"}
          <NotebooksLink />
          <span class="breadcrumb_link">
            <span class="breadcrumb_link_icon">
              <span class="breadcrumb_seperator">›</span>
            </span>
            Profile
          </span>
        {/if}

        {#if pageLayout === "notebooks"}
          <NotebooksNolink />
        {/if}

        {#if pageLayout === "notebook"}
          <NotebooksLink />
          {#if notebook?.name}
            <span class="breadcrumb_link">
              <span class="breadcrumb_link_icon">
                <span class="breadcrumb_seperator">›</span>
              </span>
              <span class="breadcrumb_link">
                {notebook.name}
              </span>
            </span>
          {/if}
          <div class="breadcrumb_edit_btn">
            <button
              class="breadcrumb_edit_fab material-icons edit_icon edit_icon_small"
              onclick={editNotebook}
              type="button"
              aria-label="Edit notebook"
            >
              edit
            </button>
          </div>
        {/if}

        {#if pageLayout === "note"}
          <NotebooksLink />
          {#if notebook?.name}
            <a href="/notebook/{notebook.id}" use:link class="breadcrumb_link">
              <span class="breadcrumb_link_icon">
                <span class="breadcrumb_seperator">›</span>
              </span>
              <span class="breadcrumb_link_btn">
                {notebook.name}
              </span>
            </a>
          {/if}
          {#if notebook?.name}
            <span class="breadcrumb_link">
              <span class="breadcrumb_link_icon">
                <span class="breadcrumb_seperator">›</span>
              </span>
              Note
            </span>
          {/if}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  @import url("../../assets/styles/breadCrumb.scss");
</style>
