<script lang="ts">
  import { snackStore } from "@/stores/snack";

  let message = $state("");
  let status = $state(false);
  const timeout = 2000;

  $effect(() => {
    const unsubscribe = snackStore.subscribe((state) => {
      if (state.n_status && state.message) {
        status = state.n_status;
        message = state.message;
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
</script>

<div class="snackbar" id="snackbar" class:show={status}>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
  <span id="snackbar-msg">{message}</span>
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
    background: var(--theme-green-snackbar);
    color: white;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 11px 16px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    opacity: 0;
    transition:
      transform 0.3s cubic-bezier(0.32, 1.2, 0.5, 1),
      opacity 0.3s ease;
    z-index: 100;
    pointer-events: none;
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
