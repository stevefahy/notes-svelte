<script lang="ts">
  import { link } from "svelte-spa-router";
</script>

<a href="/notebooks" use:link class="no_link">
  <span class="breadcrumb_group">
    <span class="material-icons-outlined breadcrumb_icon"> library_books </span>
    <span class="breadcrumb_link_btn">
      <span class="breadcrumb_link"> Notebooks</span>
    </span>
  </span>
</a>

<style>
  @import url("../../assets/styles/breadcrumb_shared.scss");
  @import url("../../assets/styles/breadcrumb_shared_link.scss");
</style>
