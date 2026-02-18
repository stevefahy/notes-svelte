import { mount } from 'svelte'
import './assets/styles/main.css'
import App from '@/App.svelte'
import { authStore } from '@/stores/auth'

async function init() {
  await authStore.verifyRefreshToken()
  mount(App, {
    target: document.getElementById('app')!,
  })
}

init()
