<script lang="ts">
  import BreadCrumb from "./BreadCrumb.svelte";
  import MenuDropdown from "../UI/MenuDropdown.svelte";
</script>

<div class="header" id="header_height">
  <div class="header_container">
    <div class="logo_container">
      <div class="header_title_logo">
        <img
          src="/assets/images/edit_white.png"
          alt="Notes logo"
          width="20"
          height="20"
        />
      </div>
      <div class="header_title">NOTES</div>
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
    background-color: #4d0000;
  }

  .header_container {
    display: flex;
    align-items: center;
    padding-left: 20px;
    min-height: 64px;
  }

  .logo_container {
    display: flex;
    align-items: baseline;
  }

  .header_toolbar {
    margin-left: auto;
  }

  .header_title {
    color: #ffffff;
    font-family: monospace;
    font-weight: 700;
    letter-spacing: 0rem;
    font-size: 2.4rem;
    padding: 0;
    margin: 0;
  }

  .header_title_logo {
    margin-right: 5px;
    width: 20px;
    height: 20px;
  }
</style>
