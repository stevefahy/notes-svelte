import { errString } from '../errString'
import APPLICATION_CONSTANTS from '../constants'
import type { CreateNoteObj, CreateNote } from '../types'

const ENV = import.meta.env
const AC = APPLICATION_CONSTANTS

export const createNote = async (token: string, note: CreateNoteObj): Promise<CreateNote> => {
  let response
  try {
    response = await fetch((ENV.VITE_API_ENDPOINT || '') + 'api/data/create-note', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(note)
    })
    if (response.status === 404) throw new Error(`${response.url} Not Found.`)
  } catch (err: unknown) {
    return { error: errString(err) }
  }
  let data: CreateNote
  try {
    data = await response.json()
    if (data === null) return { error: `${AC.NOTE_CREATE_ERROR}` }
  } catch (err: unknown) {
    return { error: errString(err) }
  }
  if (data && 'error' in data && data.error) return { error: data.error }
  return data
}
