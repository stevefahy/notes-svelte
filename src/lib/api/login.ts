import { errString } from '../errString'
import APPLICATION_CONSTANTS from '../constants'
import type { AuthAuthenticate } from '../types'

const ENV = import.meta.env
const AC = APPLICATION_CONSTANTS

export const login = async (email: string, password: string): Promise<AuthAuthenticate> => {
  let response
  try {
    response = await fetch((ENV.VITE_API_ENDPOINT || '') + 'api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (response.status === 404) throw new Error(`${response.url} Not Found.`)
    if (response.status === 401) throw new Error(`Unauthorized`)
  } catch (err: unknown) {
    return { error: errString(err) }
  }
  let data: AuthAuthenticate
  try {
    data = await response.json()
    if (data === null || data === undefined) return { error: `${AC.LOGIN_ERROR}` }
  } catch (err: unknown) {
    return { error: errString(err) }
  }
  if (data && 'error' in data && data.error) return { error: data.error }
  return data
}
