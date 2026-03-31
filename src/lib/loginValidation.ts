export type AuthConstants = typeof import("@/lib/constants").default;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function signupUsernameError(username: string, ac: AuthConstants): string {
  const t = username.trim();
  const len = t.length;
  if (len === 0) return "";
  if (len < ac.USERNAME_MIN) return ac.SIGNUP_INVALID_USERNAME;
  if (username.length > ac.USERNAME_MAX)
    return `Too long — max ${ac.USERNAME_MAX} characters`;
  return "";
}

export function signupEmailErrorMessage(email: string, ac: AuthConstants): string {
  const t = email.trim();
  if (t.length === 0) return "";
  if (!EMAIL_REGEX.test(t)) return ac.EMAIL_INVALID;
  return "";
}

export function signupPasswordError(password: string, ac: AuthConstants): string {
  if (!password) return "";
  if (password.length < ac.PASSWORD_MIN) return ac.SIGNUP_INVALID_PASSWORD;
  if (password.length > ac.PASSWORD_MAX)
    return `Max ${ac.PASSWORD_MAX} characters`;
  return "";
}

export function passwordStrengthScore(password: string, ac: AuthConstants): number {
  let s = 0;
  if (password.length >= ac.PASSWORD_MIN) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  return s;
}

export function signupTooltipText(
  username: string,
  email: string,
  password: string,
  usernameError: string,
  emailError: string,
  passwordError: string,
  ac: AuthConstants,
): string {
  if (!username.trim()) return "Enter a username";
  if (!email.trim()) return ac.EMAIL_INVALID;
  if (!password) return "Enter a password";
  if (usernameError) return usernameError;
  if (emailError) return emailError;
  if (passwordError) return passwordError;
  return "";
}
