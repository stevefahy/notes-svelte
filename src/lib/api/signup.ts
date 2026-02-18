import { errString } from '../errString'
import APPLICATION_CONSTANTS from '../constants'
import type { AuthSignup } from '../types'

const ENV = import.meta.env
const AC = APPLICATION_CONSTANTS

export const signup = async (
  username: string,
  email: string,
  password: string,
  framework: string
): Promise<AuthSignup> => {
  let response
  try {
    response = await fetch((ENV.VITE_API_ENDPOINT || '') + 'api/auth/signup', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, framework })
    })
  } catch (err: unknown) {
    return { error: errString(err) }
  }
  let data: AuthSignup
  try {
    data = await response.json()
  } catch {
    return { error: response.ok ? AC.SIGNUP_ERROR : `Server error (${response.status}). Check that the backend is running on port 5000 and the database is connected.` }
  }
  if (data === null || data === undefined) {
    return { error: response.ok ? AC.SIGNUP_ERROR : `Server error (${response.status}). Check that the backend is running on port 5000 and the database is connected.` }
  }
  if (data && 'error' in data && data.error) return { error: data.error }
  if (!response.ok) {
    return { error: (data && typeof data === 'object' && 'error' in data && data.error) ? String(data.error) : `Server error (${response.status}). Check that the backend is running on port 5000 and the database is connected.` }
  }
  return data
}
