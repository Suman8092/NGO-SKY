import { describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));
import { payuFields, validHostedRedirect, sha512 } from "./hosted-payments";
import { taxReceiptEligibility } from "./tax-receipts";
describe("hosted payment safety", () => {
  it("signs server-owned amount and payer fields without exposing the salt", () => {
    const fields = payuFields(
      "merchant",
      "secret-salt",
      "NGO_abc",
      12345,
      "Anita",
      "anita@example.invalid",
      "9999999999",
      "https://example.org/return",
    );
    expect(fields.amount).toBe("123.45");
    expect(fields.hash).toBe(
      sha512(
        "merchant|NGO_abc|123.45|Skymeredian Foundation contribution|Anita|anita@example.invalid|||||||||||secret-salt",
      ),
    );
    expect(Object.values(fields)).not.toContain("secret-salt");
    expect(
      payuFields(
        "merchant",
        "secret-salt",
        "NGO_abc",
        12346,
        "Anita",
        "anita@example.invalid",
        "9999999999",
        "https://example.org/return",
      ).hash,
    ).not.toBe(fields.hash);
  });
  it("rejects gateway redirects to lookalike hosts, credentials or insecure URLs", () => {
    expect(
      validHostedRedirect("phonepe", "https://mercury.phonepe.com/pay"),
    ).toBe(true);
    expect(validHostedRedirect("payu", "https://secure.payu.in/_payment")).toBe(
      true,
    );
    for (const url of [
      "http://mercury.phonepe.com/pay",
      "https://phonepe.com.evil.example/pay",
      "https://phonepe.com@evil.example/pay",
      "javascript:alert(1)",
    ])
      expect(validHostedRedirect("phonepe", url)).toBe(false);
  });
});
describe("80G acknowledgement safeguards", () => {
  const approval = {
    status: "active",
    data: {
      verified: true,
      startDate: "2026-04-01",
      endDate: "2027-03-31",
      pan: "ABCDE1234F",
      approvalNumber: "QA-APPROVAL",
    },
  };
  it("requires verified approval effective on the donation date", () => {
    expect(taxReceiptEligibility(null, "2026-11-05", 10000, "bank")).toEqual(
      {},
    );
    expect(
      taxReceiptEligibility(approval, "2028-01-01", 10000, "bank"),
    ).toEqual({});
    expect(
      taxReceiptEligibility(
        { ...approval, status: "revoked" },
        "2026-11-05",
        10000,
        "bank",
      ),
    ).toEqual({});
    expect(
      taxReceiptEligibility(approval, "2026-11-05", 10000, "bank")._taxApproval,
    ).toBe("QA-APPROVAL");
  });
  it("does not label cash donations over INR 2000 as eligible", () => {
    expect(
      taxReceiptEligibility(approval, "2026-11-05", 200001, "cash"),
    ).toEqual({});
    expect(
      taxReceiptEligibility(approval, "2026-11-05", 200000, "cash")._taxPan,
    ).toBe("ABCDE1234F");
  });
});
