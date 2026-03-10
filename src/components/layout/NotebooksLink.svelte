<script lang="ts">
  import { link } from "svelte-spa-router";
</script>

<a href="/notebooks" use:link class="no_link">
  <span class="breadcrumb_group">
    <span class="breadcrumb_link_btn"> Notebooks</span>
  </span>
</a>

<style>
  .no_link {
    text-decoration: none;
    color: var(--theme-text-muted);
  }

  .breadcrumb_link_btn:hover {
    text-decoration: underline;
    cursor: pointer;
  }
</style>
