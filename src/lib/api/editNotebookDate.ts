import { errString } from "../errString";
import APPLICATION_CONSTANTS from "../constants";
import type { EditNotebookDate } from "../types";

const ENV = import.meta.env;
const AC = APPLICATION_CONSTANTS;

export const editNotebookDate = async (
  token: string,
  notebookID: string,
  notebookUpdated: string,
): Promise<EditNotebookDate> => {
  let response;
  const edit = { notebookID, notebookUpdated };
  try {
    response = await fetch(
      (ENV.VITE_API_ENDPOINT || "") + "api/data/edit-notebook-date",
      {
        method: "POST",
        credentials: "include",
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
  let data: EditNotebookDate;
  try {
    data = await response.json();
    if (data === null) return { error: `${AC.NOTEBOOK_UPDATE_DATE_ERROR}`, fromServer: false };
  } catch (err: unknown) {
    return { error: errString(err), fromServer: false };
  }
  if (data && "error" in data && data.error)
    return { error: typeof data.error === "string" ? data.error : String(data.error), fromServer: true };
  return data;
};
