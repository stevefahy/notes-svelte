<script lang="ts">
  interface Props {
    userName?: string;
    email?: string;
  }
  let { userName, email }: Props = $props();
  let userName_initial = $derived(userName?.charAt(0).toUpperCase());
</script>

<div class="profile_outer">{userName_initial}</div>
<div class="profile_name">
  {#if userName}
    <div>{userName}</div>
  {/if}
</div>
<div class="profile_email">
  {#if email}
    {email}
  {/if}
</div>

<style>
  .profile_outer {
    width: 60px;
    height: 60px;
    flex-shrink: 0; /* Prevent squashing in flex layout */
    border-radius: 50%;
    background: linear-gradient(135deg, #3d9966, #2e7d52);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Lora", serif;
    font-size: 16px;
    font-weight: 600;
    color: white;
    margin-top: 48px;
    margin-bottom: 20px;
    box-shadow: var(--theme-shadow-lg);
  }
  .profile_name {
    font-family: "Lora", serif;
    font-size: 20px;
    font-weight: 600;
    color: var(--theme-text);
    margin-bottom: 3px;
  }
  .profile_email {
    font-size: 13.5px;
    color: var(--theme-text-muted);
    margin-bottom: 20px;
  }
</style>
