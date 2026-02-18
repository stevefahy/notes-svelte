<script lang="ts">
  interface Props {
    n_status: "pending" | "success" | "error" | null;
    title: string;
    message: string;
  }

  let { n_status, title, message }: Props = $props();

  const isSuccess = $derived(n_status === "success");
</script>

<div class="notification_outer">
  <section class="notification {isSuccess ? 'success' : 'error'}">
    <h2>{title}</h2>
    <p>{message}</p>
  </section>
</div>

<style>
  .notification {
    width: 100%;
    background-color: #1a8ed1;
    display: flex;
    justify-content: center;
    padding: 0.5rem 10%;
    align-items: center;
    color: white;
    flex-direction: column;
    white-space: pre-wrap;
  }

  .notification h2,
  .notification p {
    font-size: 1rem;
    margin: 0;
    padding-left: 5px;
    padding-right: 5px;
  }

  .error {
    background-color: #690000;
  }

  .success {
    background-color: #1ad1b9;
  }

  .notification_outer {
    z-index: 50;
    position: absolute;
    width: 100%;
    bottom: 0px;
    white-space: pre;
    text-align: center;
  }
</style>
