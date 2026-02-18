import { errString } from "../errString";
import APPLICATION_CONSTANTS from "../constants";
import type { SaveNote } from "../types";

const ENV = import.meta.env;
const AC = APPLICATION_CONSTANTS;

export const saveNote = async (
  token: string,
  notebookId: string,
  noteId: string,
  note: string,
): Promise<SaveNote> => {
  let response;
  const note_obj = { notebookID: notebookId, noteID: noteId, note };
  try {
    response = await fetch(
      (ENV.VITE_API_ENDPOINT || "") + "api/data/save-note",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(note_obj),
      },
    );
    if (response.status === 404) throw new Error(`${response.url} Not Found.`);
  } catch (err: unknown) {
    return { error: errString(err) };
  }
  let data: SaveNote;
  try {
    data = await response.json();
    if (data === null) return { error: `${AC.NOTE_SAVE_ERROR}` };
  } catch (err: unknown) {
    return { error: errString(err) };
  }
  if (data && "error" in data && data.error) return { error: data.error };
  return data;
};
