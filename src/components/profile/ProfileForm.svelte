<script lang="ts">
  import { get } from "svelte/store";
  import { authStore } from "@/stores/auth";
  import { changeUsername, changePassword, unwrapResponse } from "@/lib/api";
  import { showSnack } from "@/stores/snack";
  import { toUserFriendlyError } from "@/lib/errorMessageMap";
  import APPLICATION_CONSTANTS from "@/lib/constants";
  import type { ProfileFormProps, IAuthDetails } from "@/lib/types";

  let {
    userName,
    onChangePassword: _onChangePassword,
    onChangeUsername: _onChangeUsername,
  }: ProfileFormProps = $props();

  let newUsername = $state("");
  let oldPassword = $state("");
  let newPassword = $state("");
  let isSubmitting = $state(false);
  let usernameServerError = $state("");
  let passwordServerError = $state("");
  let activeTab = $state<"user" | "pass">("user");
  let tooltipSuppressed = $state(false);

  const AC = APPLICATION_CONSTANTS;

  // ── Username live validation ─────────────────────────────────────────
  const usernameError = $derived.by((): string => {
    const len = newUsername.length;
    if (len === 0) return "";
    if (len > AC.USERNAME_MAX)
      return `Too long — max ${AC.USERNAME_MAX} characters`;
    if (newUsername.trim() === userName) return "Same as your current username";
    if (newUsername.trim().length < AC.USERNAME_MIN)
      return `At least ${AC.USERNAME_MIN} characters required`;
    return "";
  });

  const usernameValid = $derived(
    newUsername.length > 0 &&
      newUsername.length <= AC.USERNAME_MAX &&
      newUsername.trim() !== userName &&
      newUsername.trim().length >= AC.USERNAME_MIN,
  );

  const usernameTooltip = $derived(
    usernameError ||
      (newUsername.length === 0 ? "Enter a new username to save" : ""),
  );

  // ── Password live validation ──────────────────────────────────────────
  const passwordError = $derived.by((): string => {
    if (!newPassword || !oldPassword) return "";
    if (newPassword === oldPassword)
      return "Must differ from your current password";
    if (newPassword.length < AC.PASSWORD_MIN)
      return `At least ${AC.PASSWORD_MIN} characters required`;
    if (newPassword.length > AC.PASSWORD_MAX)
      return `Max ${AC.PASSWORD_MAX} characters`;
    return "";
  });

  const passwordValid = $derived(
    !!oldPassword &&
      !!newPassword &&
      newPassword !== oldPassword &&
      newPassword.length >= AC.PASSWORD_MIN &&
      newPassword.length <= AC.PASSWORD_MAX,
  );

  const passwordTooltip = $derived(
    passwordError ||
      (!oldPassword || !newPassword ? "Fill in both fields to continue" : ""),
  );

  // ── Password strength bar (0–4) ───────────────────────────────────────
  const strengthScore = $derived.by((): number => {
    let s = 0;
    if (newPassword.length >= AC.PASSWORD_MIN) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  });

  const strengthClass = $derived(
    strengthScore <= 1 ? "weak" : strengthScore <= 2 ? "ok" : "good",
  );

  function suppressTooltip() {
    tooltipSuppressed = true;
  }

  function resetTooltip() {
    tooltipSuppressed = false;
  }

  function handleTooltipKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      suppressTooltip();
    }
  }

  const handleChangeUsername = async (e: Event) => {
    e.preventDefault();
    const token = get(authStore).token;
    if (!token || !usernameValid) return;
    isSubmitting = true;
    const result = unwrapResponse<{ details: IAuthDetails }>(
      await changeUsername(token, { newUsername: newUsername.trim() }),
    );
    isSubmitting = false;
    if (!result.ok) {
      usernameServerError =
        result.fromServer === true
          ? (result.error ?? AC.GENERAL_ERROR)
          : toUserFriendlyError(result.error ?? AC.GENERAL_ERROR);
    } else if (result.data.details) {
      usernameServerError = "";
      authStore.update((ctx) => ({ ...ctx, details: result.data.details }));
      showSnack({ message: "User name changed!" });
      newUsername = "";
    }
  };

  const handleChangePassword = async (e: Event) => {
    e.preventDefault();
    const token = get(authStore).token;
    if (!token || !passwordValid) return;
    isSubmitting = true;
    const result = unwrapResponse(
      await changePassword(token, { oldPassword, newPassword }),
    );
    isSubmitting = false;
    if (!result.ok) {
      passwordServerError =
        result.fromServer === true
          ? (result.error ?? AC.GENERAL_ERROR)
          : toUserFriendlyError(result.error ?? AC.GENERAL_ERROR);
    } else {
      passwordServerError = "";
      showSnack({ message: "Password updated" });
      oldPassword = "";
      newPassword = "";
    }
  };
</script>

<div class="pf-outer">
  <div class="tab-container">
    <!-- Tab bar -->
    <div class="tabs">
      <button
        class="tab"
        class:active={activeTab === "user"}
        type="button"
        onclick={() => (activeTab = "user")}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Username
      </button>
      <button
        class="tab"
        class:active={activeTab === "pass"}
        type="button"
        onclick={() => (activeTab = "pass")}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Password
      </button>
    </div>

    <!-- Tab panel -->
    <div class="tab-panel">
      {#if activeTab === "user"}
        <div class="tab-content">
          <form onsubmit={handleChangeUsername}>
            <div class="form-field">
              <label class="form-label" for="newUsername">New Username</label>
              <input
                class="form-input"
                class:input-error={!!usernameError || !!usernameServerError}
                type="text"
                id="newUsername"
                bind:value={newUsername}
                oninput={() => (usernameServerError = "")}
                placeholder="Enter new username"
              />
            </div>
            <div class="field-feedback">
              <div
                class="inline-error"
                class:visible={!!(usernameServerError || usernameError)}
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5.5" fill="#c0392b" />
                  <path
                    d="M6 3.5v3M6 8v.5"
                    stroke="white"
                    stroke-width="1.2"
                    stroke-linecap="round"
                  />
                </svg>
                <span>{usernameServerError || usernameError}</span>
              </div>
              <span
                class="char-counter"
                class:over={newUsername.length > AC.USERNAME_MAX}
              >
                {newUsername.length} / {AC.USERNAME_MAX}
              </span>
            </div>
            <div
              class="btn-wrap"
              onclick={suppressTooltip}
              onkeydown={handleTooltipKeydown}
              onmouseleave={resetTooltip}
              role="button"
              tabindex="0"
            >
              {#if !usernameValid && !tooltipSuppressed}
                <div class="btn-tooltip">{usernameTooltip}</div>
              {/if}
              <button
                type="submit"
                class="btn-save"
                disabled={!usernameValid || isSubmitting}>Save</button
              >
            </div>
          </form>
        </div>
      {/if}

      {#if activeTab === "pass"}
        <div class="tab-content">
          <form onsubmit={handleChangePassword}>
            <div class="form-field">
              <label class="form-label" for="oldPassword"
                >Current Password</label
              >
              <input
                class="form-input"
                class:input-error={!!passwordServerError}
                type="password"
                id="oldPassword"
                bind:value={oldPassword}
                oninput={() => (passwordServerError = "")}
                placeholder="Current password"
              />
            </div>
            <div class="field-feedback">
              <div class="inline-error" class:visible={!!passwordServerError}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5.5" fill="#c0392b" />
                  <path
                    d="M6 3.5v3M6 8v.5"
                    stroke="white"
                    stroke-width="1.2"
                    stroke-linecap="round"
                  />
                </svg>
                <span>{passwordServerError}</span>
              </div>
            </div>

            <div class="form-field">
              <label class="form-label" for="newPassword">New Password</label>
              <input
                class="form-input"
                class:input-error={!!passwordError}
                type="password"
                id="newPassword"
                bind:value={newPassword}
                placeholder="Min. {AC.PASSWORD_MIN} characters"
              />
            </div>
            <div class="strength-row">
              {#each [1, 2, 3, 4] as i}
                <div
                  class="bar-seg"
                  class:weak={i <= strengthScore && strengthClass === "weak"}
                  class:ok={i <= strengthScore && strengthClass === "ok"}
                  class:good={i <= strengthScore && strengthClass === "good"}
                ></div>
              {/each}
            </div>
            <div class="field-feedback">
              <div class="inline-error" class:visible={!!passwordError}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5.5" fill="#c0392b" />
                  <path
                    d="M6 3.5v3M6 8v.5"
                    stroke="white"
                    stroke-width="1.2"
                    stroke-linecap="round"
                  />
                </svg>
                <span>{passwordError}</span>
              </div>
            </div>
            <div
              class="btn-wrap"
              onclick={suppressTooltip}
              onkeydown={handleTooltipKeydown}
              onmouseleave={resetTooltip}
              role="button"
              tabindex="0"
            >
              {#if !passwordValid && !tooltipSuppressed}
                <div class="btn-tooltip">{passwordTooltip}</div>
              {/if}
              <button
                type="submit"
                class="btn-save"
                disabled={!passwordValid || isSubmitting}>Update</button
              >
            </div>
          </form>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .pf-outer {
    display: flex;
    width: 100%;
    justify-content: center;
  }

  .tab-container {
    width: 100%;
    max-width: 340px;
  }

  /* ── Tab bar ── */
  .tabs {
    display: flex;
    background: var(--theme-surface);
    border-radius: 10px 10px 0 0;
    border: 1px solid var(--theme-border-green);
    border-bottom: none;
    overflow: hidden;
  }
  .tab {
    flex: 1;
    padding: 10px 6px;
    text-align: center;
    font-family: var(--theme-font-sans);
    font-size: 13px;
    font-weight: 600;
    color: var(--theme-text-muted);
    background: var(--theme-bg);
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    transition: all 0.15s;
  }
  .tab.active {
    color: var(--theme-green);
    background: var(--theme-surface);
    border-bottom: 1px solid var(--theme-green);
  }

  /* ── Tab panel ── */
  .tab-panel {
    background: var(--theme-surface);
    border: 1px solid var(--theme-border-green);
    border-radius: 0 0 10px 10px;
    padding: 16px;
    margin-bottom: 30px;
  }
  .tab-content {
    animation: fadeUp 0.18s ease;
  }
  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ── Form ── */
  .form-field {
    margin-bottom: 4px;
  }
  .form-label {
    display: block;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--theme-text-muted);
    margin-bottom: 5px;
  }
  .form-input {
    width: 100%;
    padding: 9px 12px;
    border: 1.5px solid var(--theme-border-input);
    border-radius: 8px;
    font-family: var(--theme-font-sans);
    font-size: 13.5px;
    background: var(--theme-input-bg);
    color: var(--theme-text);
    outline: none;
    transition:
      border-color 0.15s,
      background 0.15s;
  }
  .form-input:focus {
    border-color: var(--theme-green-mid);
    background: var(--theme-surface);
    box-shadow: 0 0 0 3px rgba(61, 153, 102, 0.1);
  }
  .form-input.input-error {
    border-color: var(--theme-danger-dark);
    background: #fff8f8;
  }
  .form-input.input-error:focus {
    border-color: var(--theme-danger-dark);
  }

  /* ── Feedback row (grows when error wraps) ── */
  .field-feedback {
    min-height: 20px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
    padding: 0 1px;
  }
  .inline-error {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    flex: 1;
    min-width: 0;
    font-size: 10.5px;
    color: var(--theme-danger-dark);
    opacity: 0;
    transition: opacity 0.15s;
  }
  .inline-error.visible {
    opacity: 1;
  }
  .inline-error span {
    overflow-wrap: break-word;
    word-break: break-word;
    text-align: left;
  }
  .char-counter {
    font-size: 10px;
    color: var(--theme-text-muted);
    flex-shrink: 0;
  }
  .char-counter.over {
    color: var(--theme-danger-dark);
    font-weight: 600;
  }

  /* ── Strength bar ── */
  .strength-row {
    height: 20px;
    display: flex;
    align-items: center;
    gap: 3px;
    margin-bottom: 8px;
  }
  .bar-seg {
    height: 3px;
    flex: 1;
    border-radius: 2px;
    background: var(--theme-border);
    transition: background 0.2s;
  }
  .bar-seg.weak {
    background: var(--theme-danger-dark);
  }
  .bar-seg.ok {
    background: #d4a84b;
  }
  .bar-seg.good {
    background: var(--theme-green-mid);
  }

  /* ── Save button + tooltip ── */
  .btn-wrap {
    position: relative;
  }
  .btn-tooltip {
    position: absolute;
    bottom: calc(100% + 7px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--theme-green);
    color: white;
    font-family: var(--theme-font-sans);
    font-size: 10.5px;
    font-weight: 500;
    padding: 5px 10px;
    border-radius: 6px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    z-index: 10;
  }
  .btn-tooltip::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: var(--theme-green);
  }
  @media (hover: hover) {
    .btn-wrap:hover .btn-tooltip {
      opacity: 1;
    }
  }

  .btn-save {
    width: 100%;
    padding: 10px;
    background: var(--theme-green);
    color: white;
    border: none;
    border-radius: 8px;
    font-family: var(--theme-font-sans);
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-save:hover:not(:disabled) {
    background: var(--theme-green-dark);
  }
  .btn-save:disabled {
    background: #a0b89a;
    cursor: not-allowed;
  }
</style>
