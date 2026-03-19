<script lang="ts">
  import { push } from "@/lib/router";
  import { get } from "svelte/store";
  import { authStore } from "@/stores/auth";
  import APPLICATION_CONSTANTS from "@/lib/constants";
  import { querystring } from "svelte-spa-router";
  import { toUserFriendlyError } from "@/lib/errorMessageMap";

  const AC = APPLICATION_CONSTANTS;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let isLogin = $state(true);
  let isSubmitting = $state(false);
  let username = $state("");
  let email = $state("");
  let password = $state("");
  let fieldErrors = $state({ username: "", email: "", password: "" });
  let formError = $state("");
  let tooltipSuppressed = $state(false);

  const getRedirectPath = () => {
    const qs = $querystring || "";
    const params = new URLSearchParams(qs);
    return params.get("redirect") || AC.DEFAULT_PAGE;
  };

  const switchAuthModeHandler = () => {
    fieldErrors = { username: "", email: "", password: "" };
    formError = "";
    isLogin = !isLogin;
    username = "";
    email = "";
    password = "";
  };

  // Create Account validation (real-time)
  const usernameError = $derived.by((): string => {
    const t = username.trim();
    const len = t.length;
    if (len === 0) return "";
    if (len < AC.USERNAME_MIN) return AC.SIGNUP_INVALID_USERNAME;
    if (username.length > AC.USERNAME_MAX)
      return `Too long — max ${AC.USERNAME_MAX} characters`;
    return "";
  });

  const emailError = $derived.by((): string => {
    const t = email.trim();
    if (t.length === 0) return "";
    if (!EMAIL_REGEX.test(t)) return AC.EMAIL_INVALID;
    return "";
  });

  const passwordError = $derived.by((): string => {
    if (!password) return "";
    if (password.length < AC.PASSWORD_MIN) return AC.SIGNUP_INVALID_PASSWORD;
    if (password.length > AC.PASSWORD_MAX)
      return `Max ${AC.PASSWORD_MAX} characters`;
    return "";
  });

  const usernameValid = $derived(
    username.trim().length >= AC.USERNAME_MIN &&
      username.length <= AC.USERNAME_MAX,
  );
  const emailValid = $derived(
    email.trim().length > 0 && EMAIL_REGEX.test(email.trim()),
  );
  const passwordValid = $derived(
    password.length >= AC.PASSWORD_MIN && password.length <= AC.PASSWORD_MAX,
  );
  const signupFormValid = $derived(
    usernameValid && emailValid && passwordValid,
  );

  const strengthScore = $derived.by((): number => {
    let s = 0;
    if (password.length >= AC.PASSWORD_MIN) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  });
  const strengthClass = $derived(
    strengthScore <= 1 ? "weak" : strengthScore <= 2 ? "ok" : "good",
  );

  const signupTooltip = $derived.by((): string => {
    if (!username.trim()) return "Enter a username";
    if (!email.trim()) return AC.EMAIL_INVALID;
    if (!password) return "Enter a password";
    if (usernameError) return usernameError;
    if (emailError) return emailError;
    if (passwordError) return passwordError;
    return "";
  });

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

  const validateLoginForm = () => {
    fieldErrors = { username: "", email: "", password: "" };
    formError = "";
    let valid = true;
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      fieldErrors.email = AC.SIGNUP_INVALID_EMAIL;
      valid = false;
    }
    if (!password || password.length < AC.PASSWORD_MIN) {
      fieldErrors.password = AC.SIGNUP_INVALID_PASSWORD;
      valid = false;
    } else if (password.length > AC.PASSWORD_MAX) {
      fieldErrors.password = AC.CHANGE_PASS_TOO_MANY;
      valid = false;
    }
    return valid;
  };

  const submitHandler = async (e: Event) => {
    e.preventDefault();
    isSubmitting = true;

    const ctx = get(authStore);
    const onLogin = ctx?.onLogin;
    const onRegister = ctx?.onRegister;

    if (isLogin) {
      if (!validateLoginForm()) {
        isSubmitting = false;
        return;
      }
      try {
        const result = await onLogin?.(email, password);
        isSubmitting = false;
        if (result && !("error" in result)) {
          push(getRedirectPath());
        } else if (result && "error" in result) {
          formError =
            result.fromServer === true
              ? (result.error ?? AC.GENERAL_ERROR)
              : toUserFriendlyError(result.error ?? AC.GENERAL_ERROR);
        }
      } catch {
        isSubmitting = false;
        formError = toUserFriendlyError(AC.GENERAL_ERROR);
      }
    } else {
      if (!signupFormValid) {
        isSubmitting = false;
        return;
      }
      try {
        const result = await onRegister?.(username, email, password, "svelte");
        isSubmitting = false;
        if (!result) return;
        if ("error" in result) {
          formError =
            result.fromServer === true
              ? (result.error ?? AC.GENERAL_ERROR)
              : toUserFriendlyError(result.error ?? AC.GENERAL_ERROR);
          return;
        }
        if (
          "success" in result &&
          result.success &&
          result.notebookID &&
          result.noteID
        ) {
          push(`/notebook/${result.notebookID}/${result.noteID}`);
        } else {
          push(getRedirectPath());
        }
      } catch {
        isSubmitting = false;
        formError = toUserFriendlyError(AC.GENERAL_ERROR);
      }
    }
  };
</script>

<div class="splash-login">
  <div class="splash-top">
    <div class="splash-logo-row">
      <div class="splash-logo-mark">
        <img
          alt="logo"
          src="/assets/images/edit_white.png"
          width="20"
          height="20"
        />
      </div>
      <span class="splash-logo-text">Notes</span>
    </div>
    <div class="splash-headline">
      Your notes,<br />beautifully<br />organised.
    </div>
    <div class="splash-sub">
      Write freely, stay focused. Everything in one calm, clutter-free space.
    </div>
  </div>

  <div class="login-card">
    <h2 class="login-card-title">{isLogin ? "Sign in" : "Create account"}</h2>
    <form novalidate onsubmit={submitHandler}>
      {#if !isLogin}
        <label class="form-label" for="username">Username</label>
        <input
          class="form-input"
          class:input-error={!!usernameError || !!fieldErrors.username}
          type="text"
          id="username"
          required
          placeholder="Enter username"
          autocomplete="username"
          bind:value={username}
          oninput={() => {
            fieldErrors.username = "";
            formError = "";
          }}
        />
        <div class="field-feedback">
          <div
            class="inline-error"
            class:visible={!!(usernameError || fieldErrors.username)}
          >
            {usernameError || fieldErrors.username}
          </div>
          <span
            class="char-counter"
            class:over={username.length > AC.USERNAME_MAX}
          >
            {username.length} / {AC.USERNAME_MAX}
          </span>
        </div>
      {/if}
      <label class="form-label" for="email">Email address</label>
      <input
        class="form-input"
        class:input-error={!!(fieldErrors.email || (!isLogin && emailError))}
        type="email"
        id="email"
        required
        placeholder="Email"
        autocomplete="email"
        bind:value={email}
        onchange={() => {
          fieldErrors.email = "";
          formError = "";
        }}
        oninput={() => {
          fieldErrors.email = "";
          formError = "";
        }}
      />
      <div class="field-feedback">
        <div
          class="inline-error"
          class:visible={!!(fieldErrors.email || (!isLogin && emailError))}
        >
          {fieldErrors.email || (!isLogin ? emailError : "")}
        </div>
      </div>
      <label class="form-label" for="password">Password</label>
      <input
        class="form-input"
        class:input-error={!!(fieldErrors.password || (!isLogin && passwordError))}
        type="password"
        id="password"
        required
        placeholder={isLogin ? "Password" : `Min. ${AC.PASSWORD_MIN} Characters`}
        autocomplete={isLogin ? "current-password" : "new-password"}
        bind:value={password}
        onchange={() => {
          fieldErrors.password = "";
          formError = "";
        }}
        oninput={() => {
          fieldErrors.password = "";
          formError = "";
        }}
      />
      {#if !isLogin}
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
      {/if}
      <div class="field-feedback">
        <div
          class="inline-error"
          class:visible={!!(fieldErrors.password || (!isLogin && passwordError))}
        >
          {fieldErrors.password || (!isLogin ? passwordError : "")}
        </div>
      </div>
      {#if isLogin}
        <button class="btn-login" type="submit" disabled={isSubmitting}>
          Sign in
        </button>
      {:else}
        <div
          class="btn-wrap"
          onclick={suppressTooltip}
          onkeydown={handleTooltipKeydown}
          onmouseleave={resetTooltip}
          role="button"
          tabindex="0"
        >
          {#if !signupFormValid && !tooltipSuppressed}
            <div class="btn-tooltip">{signupTooltip}</div>
          {/if}
          <button
            class="btn-login"
            type="submit"
            disabled={!signupFormValid || isSubmitting}
          >
            Create Account
          </button>
        </div>
      {/if}
      <div class="login-alt">
        {isLogin ? "No account? " : ""}
        <button
          type="button"
          class="login-alt-link"
          onclick={switchAuthModeHandler}
        >
          {isLogin ? "Create one" : "Login with existing account"}
        </button>
      </div>
      <div class="form-error" class:visible={!!formError}>
        <svg
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
          style="flex-shrink:0"
          class="form-error-icon"
        >
          <circle cx="6" cy="6" r="5.5" fill="#b91c1c" />
          <path
            d="M6 3.5v3M6 8v.5"
            stroke="white"
            stroke-width="1.2"
            stroke-linecap="round"
          />
        </svg>
        {formError}
      </div>
    </form>
  </div>
</div>

<style>
  .splash-login {
    background: var(--theme-lime);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding-top: 2rem;
    min-height: 100dvh;
    max-height: 100dvh; /* Constrain */
    overflow-y: auto; /* Scroll when content exceeds viewport */
  }

  .splash-top {
    padding: 32px 26px 28px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .splash-logo-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 48px;
  }

  .splash-logo-mark {
    width: 38px;
    height: 38px;
    border-radius: 9px;
    background: var(--theme-green);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  }

  .splash-logo-text {
    font-family: var(--theme-font-serif);
    font-size: 25px;
    font-weight: 600;
    color: var(--theme-green);
    letter-spacing: -0.02em;
  }

  .splash-headline {
    font-family: var(--theme-font-serif);
    font-size: 34px;
    font-weight: 600;
    color: var(--theme-green);
    line-height: 1.2;
    margin-bottom: 10px;
  }

  .splash-sub {
    font-size: 13px;
    color: rgba(31, 92, 58, 0.65);
    line-height: 1.6;
  }

  .login-card {
    background: var(--theme-surface);
    border-radius: var(--theme-radius-card);
    padding: 28px 24px 32px;
    margin-top: 2rem;
    flex: 0 0 auto;
    box-shadow: var(--theme-shadow-card);
    max-width: 430px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }

  .login-card-title {
    font-family: var(--theme-font-serif);
    font-size: 19px;
    font-weight: 600;
    color: var(--theme-text);
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    font-size: 11.5px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: var(--theme-text-secondary);
    margin-bottom: 5px;
  }

  .form-input {
    width: 100%;
    background: var(--theme-input-bg);
    border: 1.5px solid var(--theme-border-input);
    border-radius: var(--theme-radius-sm);
    padding: 11px 14px;
    font-family: var(--theme-font-sans);
    font-size: 14px;
    color: var(--theme-text);
    outline: none;
    transition: border-color 0.15s;
  }

  .form-input:focus {
    border-color: var(--theme-green);
    box-shadow: 0 0 0 3px rgba(46, 125, 82, 0.12);
  }

  .form-input:-webkit-autofill,
  .form-input:-webkit-autofill:hover,
  .form-input:-webkit-autofill:focus,
  .form-input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px var(--theme-input-bg) inset !important;
    box-shadow: 0 0 0 30px var(--theme-input-bg) inset !important;
    -webkit-text-fill-color: var(--theme-text) !important;
    transition: background-color 5000s ease-in-out 0s;
  }

  .form-input.input-error {
    border-color: var(--theme-danger-dark);
    background: var(--theme-danger-light);
  }
  .form-input.input-error:focus {
    border-color: var(--theme-danger-dark);
  }

  .field-feedback {
    min-height: 20px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;
    margin-top: 2px;
    padding: 0 1px;
  }

  .char-counter {
    font-size: 10px;
    color: var(--theme-text-secondary);
    flex-shrink: 0;
  }
  .char-counter.over {
    color: var(--theme-danger-dark);
    font-weight: 600;
  }

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

  .inline-error {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    font-size: 11px;
    color: var(--theme-danger-dark);
    opacity: 0;
    transition: opacity 0.15s;
  }

  .inline-error.visible {
    opacity: 1;
  }

  .btn-login {
    width: 100%;
    background: var(--theme-green);
    color: white;
    border: none;
    border-radius: var(--theme-radius-sm);
    padding: 13px;
    font-family: var(--theme-font-sans);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 4px;
    margin-bottom: 16px;
    box-shadow: var(--theme-shadow-btn);
  }

  .btn-login:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .login-alt {
    text-align: center;
    font-size: 13px;
    color: var(--theme-text-secondary);
  }

  .login-alt-link {
    background: none;
    border: none;
    color: var(--theme-green);
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    font-size: inherit;
    font-family: inherit;
  }

  .login-alt-link:hover {
    text-decoration: underline;
  }

  .form-error {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--theme-danger-bg);
    border: 1px solid rgba(185, 28, 28, 0.25);
    border-radius: var(--theme-radius-sm);
    padding: 10px 12px;
    font-size: 12px;
    color: var(--theme-danger-dark);
    line-height: 1.4;
    margin-top: 4px;
    opacity: 0;
    max-height: 0;
    overflow: hidden;
    transition:
      opacity 0.2s,
      max-height 0.2s;
  }

  .form-error-icon {
    margin-top: -2px;
  }

  .form-error.visible {
    opacity: 1;
    max-height: 80px;
  }

  @media (max-width: 359px) {
    .splash-login {
      padding-top: 20px;
    }
    .splash-top {
      padding: 0px 16px 20px; /* Reduce from 32px 26px 28px */
    }
    .splash-headline {
      font-size: 26px;
      margin-bottom: 10px;
    }
    .splash-logo-row {
      margin-bottom: 10px;
    }
    .login-card {
      padding: 0px 16px 20px; /* Down from 28px 24px 32px */
    }
    .login-card-title {
      margin-bottom: 5px;
      margin-top: 25px;
      font-size: 15px;
    }
    .btn-login {
      margin-bottom: 8px;
      padding: 10px;
    }
  }

  @media (max-width: 431px) {
    .login-card {
      flex: 1;
      margin-top: 2rem;
      border-radius: var(--theme-radius-card) var(--theme-radius-card) 0 0;
      display: block; /* or remove display: flex - let it flow normally */
      /* Do NOT use min-height: 0 - the card must grow with content */
    }
  }

  @media (max-height: 739px) {
    .login-card {
      margin-top: 0;
    }
    .splash-logo-row {
      margin-bottom: 10px;
    }
    .splash-headline {
      margin-bottom: 5px;
    }
    .splash-top {
      padding: 0px 26px 15px;
    }
  }
</style>
