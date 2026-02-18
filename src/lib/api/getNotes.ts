import { errString } from "../errString";
import APPLICATION_CONSTANTS from "../constants";
import type { GetNotes } from "../types";

const ENV = import.meta.env;
const AC = APPLICATION_CONSTANTS;

export const getNotes = async (
  token: string,
  notebookId: string,
): Promise<GetNotes> => {
  let response;
  try {
    response = await fetch(
      (ENV.VITE_API_ENDPOINT || "") + `api/data/notes/${notebookId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status === 404) throw new Error(`${response.url} Not Found.`);
  } catch (err: unknown) {
    return { error: errString(err) };
  }
  let data: GetNotes;
  try {
    data = await response.json();
    if (data === null) return { error: `${AC.NOTES_ERROR}` };
  } catch (err: unknown) {
    return { error: errString(err) };
  }
  if (data && "error" in data && data.error) return { error: data.error };
  return data;
};
