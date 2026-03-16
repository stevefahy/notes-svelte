import { errString } from "../errString";
import APPLICATION_CONSTANTS from "../constants";
import type { Logout } from "../types";

const ENV = import.meta.env;
const AC = APPLICATION_CONSTANTS;

export const logout = async (token: string): Promise<Logout> => {
  let response;
  try {
    response = await fetch((ENV.VITE_API_ENDPOINT || "") + "api/auth/logout", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 404) throw new Error(`404 Not Found: ${response.url}`);
    if (response.status === 401) throw new Error(`Unauthorized`);
  } catch (err: unknown) {
    return { error: errString(err), fromServer: false };
  }
  let data: Logout;
  try {
    data = await response.json();
    if (data === null) return { error: `${AC.LOGOUT_ERROR}`, fromServer: false };
  } catch (err: unknown) {
    return { error: errString(err), fromServer: false };
  }
  if (data && "error" in data && data.error)
    return { error: typeof data.error === "string" ? data.error : String(data.error), fromServer: true };
  return data;
};
