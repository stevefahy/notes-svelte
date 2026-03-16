import { errString } from "../errString";
import APPLICATION_CONSTANTS from "../constants";
import type { GetNotebooks } from "../types";

const ENV = import.meta.env;
const AC = APPLICATION_CONSTANTS;

export const getNotebooks = async (token: string): Promise<GetNotebooks> => {
  let response;
  try {
    response = await fetch(
      (ENV.VITE_API_ENDPOINT || "") + "api/data/notebooks",
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status === 404) throw new Error(`404 Not Found: ${response.url}`);
  } catch (err: unknown) {
    return { error: errString(err), fromServer: false };
  }
  let data: GetNotebooks;
  try {
    data = await response.json();
    if (data === null) return { error: `${AC.NOTEBOOKS_ERROR}`, fromServer: false };
  } catch (err: unknown) {
    return { error: errString(err), fromServer: false };
  }
  if (data && "error" in data && data.error)
    return { error: typeof data.error === "string" ? data.error : String(data.error), fromServer: true };
  return data;
};
