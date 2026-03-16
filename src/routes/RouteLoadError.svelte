<script lang="ts">
  import { onMount } from "svelte";
  import { push, link } from "svelte-spa-router";
  import { showErrorSnack } from "@/stores/snack";
  import FooterView from "@/components/layout/FooterView.svelte";

  onMount(() => {
    showErrorSnack("Unable to load this page. Please try again.");
  });

  const retry = () => window.location.reload();
</script>

<div class="page_scrollable_header_breadcrumb_footer_list">
  <div class="loading_routes error-state">
    <p>Unable to load this page. Please try again.</p>
    <a href="/notebooks" use:link class="back-link">Back to Notebooks</a>
    <button class="btn-action-ghost back-link" onclick={retry} type="button">
      Retry
    </button>
  </div>
</div>
<FooterView>
  <button class="btn-action-ghost" onclick={retry} type="button">
    Retry
  </button>
  <button class="btn-action-ghost" onclick={() => push("/notebooks")}>
    Back to Notebooks
  </button>
</FooterView>
