<script lang="ts">
  import { slide } from "svelte/transition";
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

      <span class="material-symbols-outlined">more_vert</span>
    </button>

    {#if open}
      <div
        class="dropdown-menu"
        role="menu"
        transition:slide={{ duration: 150 }}
      >
        {#if success}
          <button class="dropdown-item" onclick={handleProfile} role="menuitem">
            <span class="material-icons-outlined menu_item">person</span>
            Profile
          </button>
        {/if}
        {#if !success}
          <button class="dropdown-item" onclick={loginHandler} role="menuitem">
            <span class="material-icons menu_item">login</span>
            Sign in
          </button>
        {/if}
        {#if success}
          <button class="dropdown-item" onclick={handleLogout} role="menuitem">
            <span class="material-icons menu_item danger_icon">logout</span>
            Sign out
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
    color: var(--theme-text-muted);
    background: rgba(0, 0, 0, 0.05);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--theme-border);
  }

  .nav_menu {
    padding-right: 16px;
  }

  .danger_icon {
    background: var(--theme-danger-bg);
    color: var(--theme-danger-dark);
    border-radius: 10px;
    padding: 5px;
  }
</style>
