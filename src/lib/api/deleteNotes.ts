import { errString } from "../errString";
import APPLICATION_CONSTANTS from "../constants";
import type { DeleteNotes } from "../types";

const ENV = import.meta.env;
const AC = APPLICATION_CONSTANTS;

export const deleteNotes = async (
  token: string,
  notes_selected: string[],
): Promise<DeleteNotes> => {
  let response;
  const del = { note_ids: notes_selected };
  try {
    response = await fetch(
      (ENV.VITE_API_ENDPOINT || "") + "api/data/delete-notes",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(del),
      },
    );
    if (response.status === 404) throw new Error(`${response.url} Not Found.`);
  } catch (err: unknown) {
    return { error: errString(err) };
  }
  let data: DeleteNotes;
  try {
    data = await response.json();
    if (data === null) return { error: `${AC.NOTES_DELETE_ERROR}` };
  } catch (err: unknown) {
    return { error: errString(err) };
  }
  if (data && "error" in data && data.error) return { error: data.error };
  return data;
};
