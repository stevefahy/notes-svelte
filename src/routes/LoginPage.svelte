<script lang="ts">
  import { push } from 'svelte-spa-router'
  import { get } from 'svelte/store'
  import { authStore } from '@/stores/auth'
  import APPLICATION_CONSTANTS from '@/lib/constants'
  import ErrorAlert from '@/components/UI/ErrorAlert.svelte'
  import { querystring } from 'svelte-spa-router'

  const AC = APPLICATION_CONSTANTS

  let isLogin = $state(true)
  let isSubmitting = $state(false)
  let username = $state('')
  let email = $state('')
  let password = $state('')
  let error = $state({ error_state: false, error_severity: '' as '' | 'error' | 'warning' | 'info' | 'success', message: '' })

  const getRedirectPath = () => {
    const qs = $querystring || ''
    const params = new URLSearchParams(qs)
    return params.get('redirect') || AC.DEFAULT_PAGE
  }

  const switchAuthModeHandler = () => {
    resetError()
    isLogin = !isLogin
    username = ''
    email = ''
    password = ''
  }

  const resetError = () => {
    error = { error_state: false, error_severity: '', message: '' }
  }

  const validateForm = (validate: string[]) => {
    if (validate.includes('username')) {
      if (username && username.length < 2) {
        error = { error_state: true, error_severity: 'error', message: AC.SIGNUP_INVALID_USERNAME }
        return false
      }
    }
    if (validate.includes('email')) {
      if (!email || !email.includes('@') || !email.includes('.')) {
        error = { error_state: true, error_severity: 'error', message: AC.SIGNUP_INVALID_EMAIL }
        return false
      }
    }
    if (validate.includes('password')) {
      const len = password.trim().length
      if (!password || len < AC.PASSWORD_MIN) {
        error = { error_state: true, error_severity: 'error', message: AC.SIGNUP_INVALID_PASSWORD }
        return false
      }
      if (len > AC.PASSWORD_MAX) {
        error = { error_state: true, error_severity: 'error', message: AC.CHANGE_PASS_TOO_MANY }
        return false
      }
    }
    return true
  }

  const submitHandler = async (e: Event) => {
    e.preventDefault()
    isSubmitting = true
    error = { error_state: false, error_severity: '', message: '' }

    const ctx = get(authStore)
    const onLogin = ctx?.onLogin
    const onRegister = ctx?.onRegister

    if (isLogin) {
      if (!validateForm(['email', 'password'])) {
        isSubmitting = false
        return
      }
      try {
        const result = await onLogin?.(email, password)
        isSubmitting = false
        if (result && !('error' in result)) {
          push(getRedirectPath())
        } else if (result && 'error' in result) {
          error = { error_state: true, error_severity: 'error', message: result.error ?? 'An error occurred' }
        }
      } catch (err: unknown) {
        isSubmitting = false
        error = { error_state: true, error_severity: 'error', message: String(err) }
      }
    } else {
      if (!validateForm(['username', 'email', 'password'])) {
        isSubmitting = false
        return
      }
      try {
        const result = await onRegister?.(username, email, password, 'svelte')
        isSubmitting = false
        if (!result) return
        if ('error' in result) {
          error = { error_state: true, error_severity: 'error', message: result.error ?? 'An error occurred' }
          return
        }
        if ('success' in result && result.success && result.notebookID && result.noteID) {
          push(`/notebook/${result.notebookID}/${result.noteID}`)
        } else {
          push(getRedirectPath())
        }
      } catch (err: unknown) {
        isSubmitting = false
        error = { error_state: true, error_severity: 'error', message: String(err) }
      }
    }
  }
</script>

<div class="splash-login">
  <div class="splash-top">
    <div class="splash-logo-row">
      <div class="splash-logo-mark">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1.5" y="1.5" width="17" height="17" rx="3.5" stroke="white" stroke-width="1.6"></rect>
          <path d="M6.5 13.5l1.2-3.6 6.3-6.3a1 1 0 011.4 1.4l-6.3 6.3-2.6.2z" fill="white" opacity="0.9"></path>
          <path d="M12 4.5l1.5 1.5" stroke="rgba(31,92,58,0.6)" stroke-width="1.1" stroke-linecap="round"></path>
        </svg>
      </div>
      <span class="splash-logo-text">Notes</span>
    </div>
    <div class="splash-headline">Your notes,<br>beautifully<br>organised.</div>
    <div class="splash-sub">Write freely, stay focused. Everything in one calm, clutter-free space.</div>
  </div>

  <div class="login-card">
    <h2 class="login-card-title">{isLogin ? 'Sign in' : 'Create account'}</h2>
    <form novalidate onsubmit={submitHandler}>
      {#if !isLogin}
        <label class="form-label" for="username">Your Name</label>
        <input
          class="form-input"
          type="text"
          id="username"
          required
          placeholder="Username"
          autocomplete="username"
          bind:value={username}
          oninput={resetError}
        />
      {/if}
      <label class="form-label" for="email">Email address</label>
      <input
        class="form-input"
        type="email"
        id="email"
        required
        placeholder="Email"
        autocomplete="email"
        bind:value={email}
        onchange={resetError}
        oninput={resetError}
      />
      <label class="form-label" for="password">Password</label>
      <input
        class="form-input"
        type="password"
        id="password"
        required
        placeholder={isLogin ? 'Password' : 'Password (7-10 characters)'}
        autocomplete={isLogin ? 'current-password' : 'new-password'}
        bind:value={password}
        onchange={resetError}
        oninput={resetError}
      />
      <button class="btn-login" type="submit" disabled={isSubmitting}>
        {isLogin ? 'Sign in' : 'Create Account'}
      </button>
      <div class="login-alt">
        {isLogin ? 'No account? ' : ''}
        <button type="button" class="login-alt-link" onclick={switchAuthModeHandler}>
          {isLogin ? 'Create one' : 'Login with existing account'}
        </button>
      </div>
    </form>

    {#if error.error_state}
      <ErrorAlert error_state={error.error_state} message={error.message} error_severity={error.error_severity} />
    {/if}
  </div>
</div>

<style>
  .splash-login {
    background: var(--theme-lime);
    display: flex;
    flex-direction: column;
    min-height: 100vh;
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
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: var(--theme-green);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  }

  .splash-logo-text {
    font-family: var(--theme-font-serif);
    font-size: 20px;
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
    border-radius: var(--theme-radius-card) var(--theme-radius-card) 0 0;
    padding: 28px 24px 32px;
    margin-top: auto;
    flex: 1;
    box-shadow: var(--theme-shadow-card);
  }

  @media (min-width: 768px) {
    .splash-login {
      justify-content: flex-start;
      align-items: center;
      padding-top: 2rem;
    }

    .splash-top {
      max-width: 420px;
      width: 100%;
    }

    .login-card {
      margin-top: 2rem;
      flex: 0 0 auto;
      border-radius: var(--theme-radius-card);
      max-width: 420px;
      width: 100%;
      margin-left: auto;
      margin-right: auto;
    }
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
    margin-bottom: 14px;
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
</style>
