import { errString } from "../errString";
import APPLICATION_CONSTANTS from "../constants";
import type { MoveNotes } from "../types";

const ENV = import.meta.env;
const AC = APPLICATION_CONSTANTS;

export const moveNotes = async (
  token: string,
  notebookId: string,
  notesSelected: string[],
  latestUpdatedDate: string | undefined,
): Promise<MoveNotes> => {
  let response;
  const move = {
    notes: notesSelected,
    notebookID: notebookId,
    latestUpdatedNote: latestUpdatedDate,
  };
  try {
    response = await fetch(
      (ENV.VITE_API_ENDPOINT || "") + "api/data/move-notes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(move),
      },
    );
    if (response.status === 404) throw new Error(`${response.url} Not Found.`);
  } catch (err: unknown) {
    return { error: errString(err) };
  }
  let data: MoveNotes;
  try {
    data = await response.json();
    if (data === null) return { error: `${AC.NOTES_ERROR}` };
  } catch (err: unknown) {
    return { error: errString(err) };
  }
  if (data && "error" in data && data.error) return { error: data.error };
  return data;
};
