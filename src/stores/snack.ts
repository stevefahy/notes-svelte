import { writable } from 'svelte/store'
import type { Snack } from '@/lib/types'

const initialState: Snack = {
  n_status: false,
  message: null
}

function createSnackStore() {
  const { subscribe, set } = writable(initialState)

  const ShowSnack = (param: Snack) => {
    set(param)
  }

  return { subscribe, ShowSnack }
}

export const snackStore = createSnackStore()
