<script lang="ts">
  import { snackStore } from "@/stores/snack";
  import type { SnackVariant } from "@/lib/types";

  let message = $state("");
  let status = $state(false);
  let variant = $state<SnackVariant>("success");
  const timeout = 4000;

  $effect(() => {
    const unsubscribe = snackStore.subscribe((state) => {
      if (state.n_status && state.message) {
        status = state.n_status;
        message = state.message;
        variant = state.variant ?? "success";
      }
    });
    return unsubscribe;
  });

  $effect(() => {
    if (status && message) {
      const t = setTimeout(() => {
        status = false;
        message = "";
      }, timeout);
      return () => clearTimeout(t);
    }
  });

  const isMultiLine = $derived(message.includes("\n"));
</script>

<div
  class="snackbar"
  id="snackbar"
  class:show={status}
  class:snackbar-success={variant === "success"}
  class:snackbar-error={variant === "error"}
  class:snackbar-warning={variant === "warning"}
  class:snackbar-multi={isMultiLine}
>
  {#if variant === "success"}
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      class="snackbar-icon"
    >
      <circle
        cx="8"
        cy="8"
        r="7.5"
        fill="rgba(255,255,255,0.2)"
        stroke="rgba(255,255,255,0.5)"
        stroke-width="1"
      ></circle>
      <path
        d="M4.5 8l2.5 2.5 4.5-4.5"
        stroke="white"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
    </svg>
  {:else if variant === "error"}
    <div class="snackbar-dot snackbar-dot-error" aria-hidden="true"></div>
  {:else}
    <div class="snackbar-dot snackbar-dot-warning" aria-hidden="true"></div>
  {/if}
  <span id="snackbar-msg" class="snackbar-msg">{message}</span>
</div>

<style>
  .snackbar.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  .snackbar {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 11px 16px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    opacity: 0;
    transition:
      transform 0.3s cubic-bezier(0.32, 1.2, 0.5, 1),
      opacity 0.3s ease;
    z-index: 1100;
    pointer-events: none;
  }

  .snackbar-success {
    background: var(--theme-green-snackbar);
    color: white;
    white-space: nowrap;
  }

  .snackbar-error {
    background: var(--theme-snackbar-error-bg);
    color: var(--theme-snackbar-error-text);
    white-space: nowrap;
  }

  .snackbar-warning {
    background: var(--theme-snackbar-warning-bg);
    color: var(--theme-snackbar-warning-text);
    white-space: nowrap;
  }

  .snackbar-multi {
    white-space: pre-wrap;
    max-width: 320px;
    align-items: flex-start;
  }

  .snackbar-multi .snackbar-icon,
  .snackbar-multi .snackbar-dot {
    margin-top: 2px;
    flex-shrink: 0;
  }

  .snackbar-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .snackbar-dot-error {
    background: var(--theme-snackbar-error-dot);
  }

  .snackbar-dot-warning {
    background: var(--theme-snackbar-warning-dot);
  }

  @media (min-width: 768px) {
    .snackbar {
      bottom: auto;
      top: 24px;
      transform: translateX(-50%) translateY(-80px);
    }
    .snackbar.show {
      transform: translateX(-50%) translateY(0);
    }
  }
</style>
