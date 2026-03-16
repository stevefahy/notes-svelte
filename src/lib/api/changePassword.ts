import { errString } from "../errString";
import APPLICATION_CONSTANTS from "../constants";
import type { ChangePassword } from "../types";

const ENV = import.meta.env;
const AC = APPLICATION_CONSTANTS;

export const changePassword = async (
  token: string,
  passwordData: { oldPassword: string; newPassword: string },
): Promise<ChangePassword> => {
  let response;
  try {
    response = await fetch(
      (ENV.VITE_API_ENDPOINT || "") + "api/auth/change-password",
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      },
    );
    if (response.status === 404) throw new Error(`404 Not Found: ${response.url}`);
  } catch (err: unknown) {
    return { error: errString(err), fromServer: false };
  }
  let data: ChangePassword;
  try {
    data = await response.json();
    if (data === null) return { error: `${AC.CHANGE_PASS_ERROR}`, fromServer: false };
  } catch (err: unknown) {
    return { error: errString(err), fromServer: false };
  }
  if (data && "error" in data && data.error)
    return { error: typeof data.error === "string" ? data.error : String(data.error), fromServer: true };
  return data;
};
