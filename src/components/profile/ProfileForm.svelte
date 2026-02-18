<script lang="ts">
  import { get } from "svelte/store";
  import { authStore } from "@/stores/auth";
  import { changeUsername, changePassword } from "@/lib/api";
  import { notificationStore } from "@/stores/notification";
  import { snackStore } from "@/stores/snack";
  import APPLICATION_CONSTANTS from "@/lib/constants";
  import ErrorAlert from "@/components/UI/ErrorAlert.svelte";
  import type { ProfileFormProps } from "@/lib/types";

  let { userName, onChangePassword, onChangeUsername }: ProfileFormProps =
    $props();

  let newUsername = $state("");
  let oldPassword = $state("");
  let newPassword = $state("");
  // let confirmPassword = $state('')
  let error = $state({ error_state: false, message: "" });
  let isSubmitting = $state(false);
  let userNameToggle = $state(false);
  let passwordToggle = $state(false);

  const AC = APPLICATION_CONSTANTS;

  const showNotification = (msg: string) => {
    notificationStore.ShowNotification({
      notification: { n_status: "error", title: "Error!", message: msg },
    });
  };

  const resetToggle = () => {
    error = { error_state: false, message: "" };
    userNameToggle = false;
    passwordToggle = false;
    oldPassword = "";
    newPassword = "";
    // confirmPassword = ''
    newUsername = userName ?? "";
  };

  const toggleUserName = () => {
    error = { error_state: false, message: "" };
    passwordToggle = false;
    userNameToggle = !userNameToggle;
    if (userNameToggle) {
      newUsername = userName ?? "";
    }
  };

  const togglePassword = () => {
    error = { error_state: false, message: "" };
    userNameToggle = false;
    passwordToggle = !passwordToggle;
  };

  const handleChangeUsername = async (e: Event) => {
    e.preventDefault();
    const token = get(authStore).token;
    if (!token || !newUsername.trim()) return;
    if (newUsername.length < AC.USERNAME_MIN) {
      error = { error_state: true, message: AC.CHANGE_USER_TOO_FEW };
      return;
    }
    if (newUsername.length > AC.USERNAME_MAX) {
      error = { error_state: true, message: AC.CHANGE_USER_TOO_MANY };
      return;
    }
    if (newUsername === userName) {
      error = { error_state: true, message: AC.CHANGE_USER_UNIQUE };
      return;
    }
    isSubmitting = true;
    error = { error_state: false, message: "" };
    const result = await changeUsername(token, {
      newUsername: newUsername.trim(),
    });
    isSubmitting = false;
    if (result && "error" in result) {
      showNotification(result.error ?? AC.GENERAL_ERROR);
    } else if (result && "success" in result && result.details) {
      authStore.update((ctx) => ({ ...ctx, details: result.details }));
      snackStore.ShowSnack({ n_status: true, message: "User name changed!" });
      resetToggle();
    }
  };

  const handleChangePassword = async (e: Event) => {
    e.preventDefault();
    const token = get(authStore).token;
    if (!token) return;
    if (oldPassword === newPassword) {
      error = { error_state: true, message: AC.CHANGE_PASS_UNIQUE };
      return;
    }
    if (newPassword.length < AC.PASSWORD_MIN) {
      error = { error_state: true, message: AC.CHANGE_PASS_TOO_FEW };
      return;
    }
    if (newPassword.length > AC.PASSWORD_MAX) {
      error = { error_state: true, message: AC.CHANGE_PASS_TOO_MANY };
      return;
    }
    // if (newPassword !== confirmPassword) {
    //   error = { error_state: true, message: AC.CHANGE_PASS_LENGTH }
    //   return
    // }
    isSubmitting = true;
    error = { error_state: false, message: "" };
    const result = await changePassword(token, { oldPassword, newPassword });
    isSubmitting = false;
    if (result && "error" in result) {
      showNotification(result.error ?? AC.GENERAL_ERROR);
    } else if (result && "success" in result) {
      snackStore.ShowSnack({ n_status: true, message: "Password updated" });
      resetToggle();
    }
  };
</script>

<div class="change_buttons">
  <button
    type="button"
    class="btn-contained"
    aria-label="User Name button"
    onclick={toggleUserName}
  >
    User Name
  </button>
  <button
    type="button"
    class="btn-contained"
    aria-label="Password button"
    onclick={togglePassword}
  >
    Password
  </button>
</div>

{#if userNameToggle}
  <div class="form_container">
    <form onsubmit={handleChangeUsername} class="form">
      <div class="control">
        <label for="newUsername">User name</label>
        <input
          type="text"
          id="newUsername"
          bind:value={newUsername}
          placeholder="New username"
        />
      </div>
      <button type="submit" disabled={isSubmitting} class="btn-contained"
        >Change User Name</button
      >
    </form>
  </div>
{/if}

{#if passwordToggle}
  <div class="form_container">
    <form onsubmit={handleChangePassword} class="form">
      <h3>Change Password</h3>
      <div class="control">
        <label for="oldPassword">Current Password</label>
        <input type="password" id="oldPassword" bind:value={oldPassword} />
      </div>
      <div class="control">
        <label for="newPassword">New Password</label>
        <input type="password" id="newPassword" bind:value={newPassword} />
      </div>
      <button type="submit" disabled={isSubmitting} class="btn-contained"
        >Update Password</button
      >
    </form>
  </div>
{/if}

{#if error.error_state}
  <ErrorAlert error_state={error.error_state} message={error.message} />
{/if}

<style>
  .form {
    margin: 1.5rem auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .form button[type="submit"] {
    margin-top: 1.5rem;
  }

  .control {
    margin-bottom: 0.5rem;
  }

  .control label {
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #353336;
    display: block;
  }

  .control input {
    display: block;
    font: inherit;
    width: 100%;
    border-radius: 4px;
    border: 1px solid #38015c;
    padding: 0.25rem;
    background-color: #f7f0fa;
  }

  .change_buttons {
    display: flex;
    flex-direction: row;
    align-content: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 20px;
  }

  .change_buttons .btn-contained {
    padding: 10px 20px;
  }

  .form_container {
    display: flex;
    flex-direction: row;
    align-content: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 20px;
  }
</style>
