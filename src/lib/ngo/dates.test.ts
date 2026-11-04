import { describe, it, expect } from "vitest";
import { addCalendarMonths } from "./dates";
describe("membership validity", () => {
  it("clamps month-end and leap-year renewals", () => {
    expect(addCalendarMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addCalendarMonths("2024-02-29", 12)).toBe("2025-02-28");
    expect(addCalendarMonths("2026-11-05", 12)).toBe("2027-11-05");
  });
  it("rejects invalid terms", () => {
    expect(() => addCalendarMonths("invalid", 12)).toThrow();
    expect(() => addCalendarMonths("2026-11-05", 0)).toThrow();
  });
});
