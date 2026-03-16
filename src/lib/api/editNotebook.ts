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
    if (response.status === 404) throw new Error(`404 Not Found: ${response.url}`);
  } catch (err: unknown) {
    return { error: errString(err), fromServer: false };
  }
  let data: EditNotebook;
  try {
    data = await response.json();
    if (data === null) return { error: `${AC.NOTES_ERROR}`, fromServer: false };
  } catch (err: unknown) {
    return { error: errString(err), fromServer: false };
  }
  if (data && "error" in data && data.error)
    return { error: typeof data.error === "string" ? data.error : String(data.error), fromServer: true };
  return data;
};
