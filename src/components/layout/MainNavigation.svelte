<script lang="ts">
  import BreadCrumb from "./BreadCrumb.svelte";
  import MenuDropdown from "../UI/MenuDropdown.svelte";
</script>

<div class="header" id="header_height">
  <div class="header_container">
    <div class="logo_row">
      <div class="logo_mark">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1.5" y="1.5" width="17" height="17" rx="3.5" stroke="white" stroke-width="1.6"></rect>
          <path d="M6.5 13.5l1.2-3.6 6.3-6.3a1 1 0 011.4 1.4l-6.3 6.3-2.6.2z" fill="white" opacity="0.9"></path>
        </svg>
      </div>
      <span class="logo_text">Notes</span>
    </div>
    <div class="header_toolbar">
      <MenuDropdown />
    </div>
  </div>
</div>
<BreadCrumb />

<style>
  .header {
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 18px 10px;
    background: var(--theme-surface);
    border-bottom: 1px solid var(--theme-border);
  }

  .header_container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 44px;
  }

  .logo_row {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .logo_mark {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: var(--theme-green);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .logo_text {
    font-family: var(--theme-font-serif);
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--theme-text);
  }

  .header_toolbar {
    margin-left: auto;
  }
</style>
