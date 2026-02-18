<script lang="ts">
  import { fly, slide } from "svelte/transition";
  import { authStore } from "@/stores/auth";
  import { push } from "svelte-spa-router";
  import APPLICATION_CONSTANTS from "@/lib/constants";

  const AC = APPLICATION_CONSTANTS;

  let open = $state(false);
  let rippleKey = $state(0);

  const toggleMenu = () => {
    open = !open;
    rippleKey++;
  };

  const handleProfile = () => {
    open = false;
    push("/profile");
  };

  const loginHandler = () => {
    open = false;
    push(AC.LOGIN_PAGE);
  };

  const handleLogout = () => {
    open = false;
    const ctx = $authStore;
    if (ctx?.onLogout) ctx.onLogout();
  };

  const ctx = $derived($authStore);
  const success = $derived(ctx?.success);
  const details = $derived(ctx?.details);
</script>

<div class="nav_menu">
  <div class="dropdown">
    <button
      class="icon more_vert"
      class:is-active={open}
      onclick={toggleMenu}
      onkeydown={(e) => e.key === "Escape" && (open = false)}
      aria-haspopup="true"
      aria-expanded={open}
      type="button"
    >
      {#if rippleKey > 0}
        {#key rippleKey}
          <span class="ripple-burst"></span>
        {/key}
      {/if}

      <span
        class="material-symbols-outlined material-icons v-icon notranslate v-theme--myCustomLightTheme v-icon--size-default"
        >more_vert</span
      >
    </button>
    <span class="v-btn_overlay"></span>
    <span class="v-btn_underlay"></span>
    {#if open}
      <!-- <div class="dropdown-menu" role="menu" transition:fly={{ y: -8, duration: 200 }}> -->
      <div
        class="dropdown-menu"
        role="menu"
        transition:slide={{ duration: 150 }}
      >
        {#if success && details}
          <button class="dropdown-item" onclick={handleProfile} role="menuitem">
            <span class="material-icons menu_item">account_circle</span>
            {details.username}
          </button>
        {/if}
        {#if success}
          <button class="dropdown-item" onclick={handleProfile} role="menuitem">
            <span class="material-icons menu_item">settings</span>
            Settings
          </button>
        {/if}
        {#if !success}
          <button class="dropdown-item" onclick={loginHandler} role="menuitem">
            <span class="material-icons menu_item">login</span>
            Login
          </button>
        {/if}
        {#if success}
          <button class="dropdown-item" onclick={handleLogout} role="menuitem">
            <span class="material-icons menu_item">logout</span>
            logout
          </button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<svelte:window
  onclick={(e) => {
    if (open && !(e.target instanceof Element && e.target.closest(".dropdown")))
      open = false;
  }}
/>

<style>
  .icon {
    color: white !important;
  }

  .icon .material-icons {
    color: white;
  }

  .icon :global(i.material-icons) {
    color: white;
  }

  .icon :global(.v-btn__content .material-icons) {
    color: white !important;
  }

  .icon span .material-icons,
  .icon span :global(.material-symbols-outlined) {
    color: white !important;
  }

  .nav_menu {
    padding-right: 24px;
  }
</style>
