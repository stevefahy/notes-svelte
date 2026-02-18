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
    if (response.status === 404) throw new Error(`${response.url} Not Found.`);
    if (response.status === 401) throw new Error(`Unauthorized`);
  } catch (err: unknown) {
    return { error: errString(err) };
  }
  let data: ChangePassword;
  try {
    data = await response.json();
    if (data === null) return { error: `${AC.CHANGE_PASS_ERROR}` };
  } catch (err: unknown) {
    return { error: errString(err) };
  }
  if (data && "error" in data && data.error) return { error: data.error };
  return data;
};
