import { errString } from "../errString";
import APPLICATION_CONSTANTS from "../constants";
import type { DeleteNotebook } from "../types";

const ENV = import.meta.env;
const AC = APPLICATION_CONSTANTS;

export const deleteNotebook = async (
  token: string,
  notebook_id: string,
): Promise<DeleteNotebook> => {
  let response;
  const payload = { notebookID: notebook_id };
  try {
    response = await fetch(
      (ENV.VITE_API_ENDPOINT || "") + "api/data/delete-notebook",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );
    if (response.status === 404) throw new Error(`${response.url} Not Found.`);
  } catch (err: unknown) {
    return { error: errString(err) };
  }
  let data: DeleteNotebook;
  try {
    data = await response.json();
    if (data === null) return { error: `${AC.NOTEBOOK_DELETE_ERROR}` };
  } catch (err: unknown) {
    return { error: errString(err) };
  }
  if (data && "error" in data && data.error) return { error: data.error };
  return data;
};
