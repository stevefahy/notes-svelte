import { errString } from "../errString";
import APPLICATION_CONSTANTS from "../constants";
import type { GetNotebook } from "../types";

const ENV = import.meta.env;
const AC = APPLICATION_CONSTANTS;

export const addNotebook = async (
  token: string,
  notebook_name: string,
  notebook_cover: string,
): Promise<GetNotebook> => {
  let response;
  const notebook = {
    notebookName: notebook_name,
    notebookCover: notebook_cover,
  };
  try {
    response = await fetch(
      (ENV.VITE_API_ENDPOINT || "") + "api/data/addnotebook",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notebook),
      },
    );
    if (response.status === 404) throw new Error(`${response.url} Not Found.`);
  } catch (err: unknown) {
    return { error: errString(err) };
  }
  let data: GetNotebook;
  try {
    data = await response.json();
    if (data === null) return { error: `${AC.NOTEBOOK_CREATE_ERROR}` };
  } catch (err: unknown) {
    return { error: errString(err) };
  }
  if (data && "error" in data && data.error) return { error: data.error };
  return data;
};
