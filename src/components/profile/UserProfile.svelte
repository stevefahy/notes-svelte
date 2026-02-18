<script lang="ts">
  interface Props {
    userName?: string;
    email?: string;
  }
  let { userName, email }: Props = $props();
</script>

<div>
  {#if userName}
    <h2>{userName}</h2>
  {/if}
  {#if email}
    <h3 class="profile_email">{email}</h3>
  {/if}
</div>

<style>
  .profile_email {
    font-size: 1rem;
    color: #666;
    font-weight: 400;
    margin-top: 0.25rem;
  }
</style>
