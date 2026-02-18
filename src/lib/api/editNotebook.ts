import { errString } from "../errString";
import APPLICATION_CONSTANTS from "../constants";
import type { EditNotebook } from "../types";

const ENV = import.meta.env;
const AC = APPLICATION_CONSTANTS;

export const editNotebook = async (
  token: string,
  notebookID: string,
  notebookName: string,
  notebookCover: string,
  notebookUpdated: string,
): Promise<EditNotebook> => {
  let response;
  const edit = { notebookID, notebookName, notebookCover, notebookUpdated };
  try {
    response = await fetch(
      (ENV.VITE_API_ENDPOINT || "") + "api/data/edit-notebook",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(edit),
      },
    );
    if (response.status === 404) throw new Error(`${response.url} Not Found.`);
  } catch (err: unknown) {
    return { error: errString(err) };
  }
  let data: EditNotebook;
  try {
    data = await response.json();
    if (data === null) return { error: `${AC.NOTES_ERROR}` };
  } catch (err: unknown) {
    return { error: errString(err) };
  }
  if (data && "error" in data && data.error) return { error: data.error };
  return data;
};
