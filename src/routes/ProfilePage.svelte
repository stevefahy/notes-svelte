<script lang="ts">
  import { authStore } from '@/stores/auth'
  import UserProfile from '@/components/profile/UserProfile.svelte'
  import ProfileForm from '@/components/profile/ProfileForm.svelte'

  const ctx = $derived($authStore)
</script>

<div class="profile">
  <UserProfile userName={ctx?.details?.username} email={ctx?.details?.email} />
  <ProfileForm
    userName={ctx?.details?.username}
    onChangePassword={(data) => {
      /* handled in ProfileForm */
    }}
    onChangeUsername={(data) => {
      /* handled in ProfileForm */
    }}
  />
</div>

