<script lang="ts">
  let { children } = $props();
</script>

<div class="page_footer">
  <div class="page_footer_container">
    {@render children?.()}
  </div>
</div>

<style>
  .page_footer {
    width: 100%;
    position: fixed;
    height: calc(var(--footer-height) * 1px);
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    bottom: 0px;
    z-index: 6;
    background-color:var(--theme-surface);
  }

  .page_footer_container {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    flex-wrap: nowrap;
    flex-direction: row;
  }
</style>
