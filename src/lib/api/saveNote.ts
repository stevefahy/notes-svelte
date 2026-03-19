import { errString } from "../errString";
import { normalizeErrorToString } from "../errorMessageMap";
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
    if (response.status === 404) throw new Error(`404 Not Found: ${response.url}`);
  } catch (err: unknown) {
    return { error: errString(err), fromServer: false };
  }
  if (!response.ok) {
    try {
      const errData = await response.json();
      if (errData && typeof errData.error === "string")
        return { error: errData.error, fromServer: true };
    } catch {
      // Empty or invalid body — server may be down (e.g. 502 from proxy)
    }
    return {
      error:
        response.status >= 500
          ? "The server could not be reached. Please try again."
          : AC.NOTE_SAVE_ERROR,
      fromServer: false,
    };
  }
  let data: SaveNote;
  try {
    data = await response.json();
    if (data === null) return { error: `${AC.NOTE_SAVE_ERROR}`, fromServer: false };
  } catch (err: unknown) {
    return { error: errString(err), fromServer: false };
  }
  if (data && "error" in data && data.error)
    return { error: normalizeErrorToString(data.error, AC.NOTE_SAVE_ERROR), fromServer: true };
  return data;
};
