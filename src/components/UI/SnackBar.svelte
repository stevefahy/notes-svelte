<script lang="ts">
  import { snackStore } from '@/stores/snack'

  let message = $state('')
  let status = $state(false)
  const timeout = 2000

  const unsubscribe = snackStore.subscribe((state) => {
    if (state.n_status && state.message) {
      status = state.n_status
      message = state.message
    }
  })

  $effect(() => {
    if (status && message) {
      const t = setTimeout(() => {
        status = false
        message = ''
      }, timeout)
      return () => clearTimeout(t)
    }
  })
</script>

{#if status && message}
  <div class="snackbar snack_outer" role="status">
    <span class="icon_text snack_text">
      <span class="material-symbols-outlined button_icon snack_icon"> check_circle </span>
      {message}
    </span>
  </div>
{/if}

<style>
  .snackbar.snack_outer {
    z-index: 100;
    position: fixed;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: rgb(236, 247, 237);
    color: #116600;
    padding: 12px 24px;
    border-radius: 15px;
    min-width: 150px;
    max-width: 50%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .snack_outer {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .snack_icon {
    color: #116600;
  }

  .snack_text {
    color: #116600;
    font-size: 1rem;
    font-weight: 500;
  }
</style>
