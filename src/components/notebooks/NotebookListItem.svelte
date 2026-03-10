<script lang="ts">
  import { link } from "svelte-spa-router";
  import DateFormat from "@/lib/dateFormat";
  import { getDisplayCover } from "@/lib/notebookCoverUtils";
  import type { Notebook } from "@/lib/types";

  interface Props {
    notebook_item: Notebook;
  }
  let { notebook_item }: Props = $props();
  const displayCover = $derived(getDisplayCover(notebook_item.notebook_cover));
</script>

<a href="/notebook/{notebook_item._id}" use:link class="notebook-link">
  <li class="notebooks_list_bg">
    <div class="vcard">
      <div class="cardcontent"></div>
      <div class="notebooks_list_outer">
        <div class="notebooks_list_left tab_{displayCover}">
          <div class="nb-spine-{displayCover}"></div>
        </div>
        <div class="notebooks_list_right">
          <div>{notebook_item.notebook_name}</div>
          <div class="date_format">
            {DateFormat(notebook_item.updatedAt ?? "")}
          </div>
        </div>
        {#if notebook_item.noteCount !== undefined}
          <span class="nb-count">
            {notebook_item.noteCount}
            {notebook_item.noteCount === 1 ? "note" : "notes"}
          </span>
        {/if}
        <div class="notebooks_list_arrow">›</div>
      </div>
    </div>
  </li>
</a>

<style>
  @import url("../../assets/styles/notebook-list-shared.scss");
  @import url("../../assets/styles/list-container.scss");

  :global(.nb-count) {
    font-size: 12px;
    color: var(--theme-text-muted);
    background: var(--theme-bg);
    border-radius: 99px;
    padding: 2px 8px;
    font-weight: 500;
    white-space: nowrap;
  }
</style>
