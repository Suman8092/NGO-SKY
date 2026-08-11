import { describe, expect, it } from "vitest";

import { resolveContactSubject } from "./contact-subjects";

describe("contact subject routing", () => {
  it("resolves canonical public subject slugs", () => {
    expect(resolveContactSubject("partnerships")).toBe("Partnerships");
    expect(resolveContactSubject("donation-support")).toBe("Donation support");
    expect(resolveContactSubject("campaign-support")).toBe("Campaign support");
    expect(resolveContactSubject("impact")).toBe("Impact and data");
  });

  it("keeps old links useful and rejects arbitrary select values", () => {
    expect(resolveContactSubject("donations-receipts")).toBe(
      "Donation support",
    );
    expect(resolveContactSubject("event-resource")).toBe("Events");
    expect(resolveContactSubject("not-a-real-subject")).toBe("General enquiry");
  });
});
