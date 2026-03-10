<script lang="ts">
  interface Props {
    error_state?: boolean;
    error_severity?: "" | "error" | "warning" | "info" | "success";
    message?: string;
  }

  let { error_state, error_severity = "warning", message }: Props = $props();

  const errorCase = $derived(error_severity || "warning");
</script>

{#if error_state && message}
  <div class="error_alert_position">
    <div class="error_alert {errorCase}">
      <div class="error_alert_message">
        <span
          class="material-symbols-outlined error_alert_icon {errorCase}_icon"
        >
          {errorCase === "success" ? "check_circle" : "error"}
        </span>
        {message}
      </div>
    </div>
  </div>
{/if}

<style>
  .warning {
    color: rgb(95, 33, 32);
    background-color: rgb(253, 237, 237);
  }

  .success {
    color: #00360f;
    background-color: #e8ffef;
  }

  .warning_icon {
    color: #da4948;
  }

  .success_icon {
    color: #116600;
  }

  .error_alert_message {
    color: var(--theme-danger-dark);
    padding: 8px 0;
    display: flex;
    align-items: center;
  }

  .error_alert_icon {
    padding-right: 5px;
  }
</style>
