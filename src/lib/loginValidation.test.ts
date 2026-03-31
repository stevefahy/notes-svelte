import { describe, it, expect } from "vitest";
import {
  EMAIL_REGEX,
  signupUsernameError,
  signupEmailErrorMessage,
  signupPasswordError,
  passwordStrengthScore,
} from "./loginValidation";

const ac = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 10,
  SIGNUP_INVALID_USERNAME: "bad user",
  EMAIL_INVALID: "bad email",
  SIGNUP_INVALID_PASSWORD: "bad pass",
  PASSWORD_MIN: 7,
  PASSWORD_MAX: 20,
} as import("./loginValidation").AuthConstants;

describe("loginValidation", () => {
  it("EMAIL_REGEX accepts simple address", () => {
    expect(EMAIL_REGEX.test("a@b.co")).toBe(true);
  });

  it("signupUsernameError empty when short trim", () => {
    expect(signupUsernameError("  ", ac)).toBe("");
  });

  it("signupEmailErrorMessage", () => {
    expect(signupEmailErrorMessage("x", ac)).toBe(ac.EMAIL_INVALID);
    expect(signupEmailErrorMessage("", ac)).toBe("");
  });

  it("passwordStrengthScore", () => {
    expect(passwordStrengthScore("short", ac)).toBe(0);
    expect(passwordStrengthScore("longenough", ac)).toBeGreaterThan(0);
  });

  it("signupPasswordError", () => {
    expect(signupPasswordError("123456", ac)).toBe(ac.SIGNUP_INVALID_PASSWORD);
  });
});
