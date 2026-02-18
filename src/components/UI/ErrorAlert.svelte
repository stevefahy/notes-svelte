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

  .error_alert_position {
    position: relative;
    top: 0px;
    margin-top: 10px;
  }

  .error_alert {
    transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    border-radius: 4px;
    box-shadow: none;
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-weight: 400;
    font-size: 0.875rem;
    line-height: 1.43;
    letter-spacing: 0.01071em;
    display: flex;
    padding: 6px 16px;
  }

  .error_alert_message {
    padding: 8px 0;
    display: flex;
    align-items: center;
  }

  .error_alert_icon {
    float: left;
    padding-right: 5px;
    width: 29px;
    height: 24px;
    align-self: flex-start;
  }
</style>
