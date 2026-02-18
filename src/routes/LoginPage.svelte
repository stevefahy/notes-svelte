<script lang="ts">
  import { push } from 'svelte-spa-router'
  import { get } from 'svelte/store'
  import { authStore } from '@/stores/auth'
  import APPLICATION_CONSTANTS from '@/lib/constants'
  import ErrorAlert from '@/components/UI/ErrorAlert.svelte'
  import { querystring } from 'svelte-spa-router'
  import { vCard, vCardText, vCardTitle } from '@/lib/vuetify-classes'

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

<section class="auth">
  <div class={vCard('card')}>
    <h2 class={vCardTitle('header')}>{isLogin ? 'Login' : 'Sign Up'}</h2>
    <div class={vCardText('card-content')}>
      <form novalidate onsubmit={submitHandler}>
        {#if !isLogin}
          <div class="control">
            <label for="username">Your Name</label>
            <input
              type="text"
              id="username"
              required
              placeholder="Username"
              autocomplete="username"
              bind:value={username}
              oninput={resetError}
            />
          </div>
        {/if}
        <div class="control">
          <label for="email">Your Email</label>
          <input
            type="email"
            id="email"
            required
            placeholder="Email"
            autocomplete="email"
            bind:value={email}
            onchange={resetError}
            oninput={resetError}
          />
        </div>
        <div class="control">
          <label for="password">Your Password</label>
          <input
            type="password"
            id="password"
            required
            placeholder={isLogin ? 'Password' : 'Password (7-10 characters)'}
            autocomplete={isLogin ? 'current-password' : 'new-password'}
            bind:value={password}
            onchange={resetError}
            oninput={resetError}
          />
        </div>
        <div class="actions">
          <button class="btn-contained v-btn v-btn--elevated v-theme--myCustomLightTheme bg-secondary v-btn--density-default v-btn--size-default v-btn--variant-elevated contained medium" type="submit" disabled={isSubmitting}>
            {isLogin ? 'Login' : 'Create Account'}
          </button>
          <button class="btn-text" type="button" onclick={switchAuthModeHandler}>
            {isLogin ? 'Create new account' : 'Login with existing account'}
          </button>
        </div>
      </form>

      {#if error.error_state}
        <ErrorAlert error_state={error.error_state} message={error.message} error_severity={error.error_severity} />
      {/if}
    </div>
  </div>
</section>

<style>
  .auth {
    margin: 3rem auto;
    width: 95%;
    max-width: 25rem;
    border-radius: 6px;
    padding: 1rem;
    text-align: center;
  }

  .control {
    margin-bottom: 0.5rem;
  }

  .control label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .actions {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .actions button {
    cursor: pointer;
  }

  .header {
    margin: 0px;
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-weight: 400;
    font-size: 1.5rem;
    line-height: 1.334;
    letter-spacing: 0em;
    display: block;
    padding: 16px;
  }

  .auth .card {
    border-radius: 6px;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.15);
    background: #fff;
    overflow: hidden;
  }

  .auth .card-content {
    padding: 0 16px 16px;
  }

  .error-enter-active,
  .error-leave-active {
    transition: opacity 0.5s ease;
  }

  .error-enter-from,
  .error-leave-to {
    opacity: 0;
  }
</style>
