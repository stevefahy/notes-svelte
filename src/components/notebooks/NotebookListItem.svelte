<script lang="ts">
  import { link } from "svelte-spa-router";
  import DateFormat from "@/lib/dateFormat";
  import type { Notebook } from "@/lib/types";
  import { vCard, vCardText } from "@/lib/vuetify-classes";

  interface Props {
    notebook_item: Notebook;
  }
  let { notebook_item }: Props = $props();
</script>

<a href="/notebook/{notebook_item._id}" use:link class="notebook-link">
  <li class="notebooks_list_bg">
    <div class={vCard()}>
      <div class={vCardText("cardcontent")}>
        <div class="notebooks_list_outer">
          <div
            class="notebooks_list_left tab_{notebook_item.notebook_cover}"
          ></div>
          <div class="notebooks_list_right">
            <div>{notebook_item.notebook_name}</div>
            <div class="date_format">
              {DateFormat(notebook_item.updatedAt ?? "")}
            </div>
          </div>
        </div>
      </div>
    </div>
  </li>
</a>

<style>
  @import url("../../assets/styles/notebook-list-shared-css.scss");
</style>
