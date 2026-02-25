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
    background-color: #F4F9F1;
    z-index: 6;
    background-color: rgba(244, 249, 241, 0.5);
    backdrop-filter: blur(1px);
    -webkit-backdrop-filter: blur(8px);
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
