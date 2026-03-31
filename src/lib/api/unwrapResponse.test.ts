import { describe, it, expect } from "vitest";
import { unwrapResponse } from "./unwrapResponse";

describe("unwrapResponse", () => {
  it("returns ok data when success is true", () => {
    const r = unwrapResponse<{ id: number }>({ success: true, id: 1 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.id).toBe(1);
  });

  it("returns error when error field is present", () => {
    const r = unwrapResponse({ error: "nope", fromServer: true });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toBe("nope");
      expect(r.fromServer).toBe(true);
    }
  });

  it("returns error for null", () => {
    const r = unwrapResponse(null);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("No response");
  });

  it("returns error when success is not true", () => {
    const r = unwrapResponse({ success: false });
    expect(r.ok).toBe(false);
  });
});
