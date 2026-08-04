import { describe, expect, it } from "vitest";

import {
  contactSchema,
  donationSchema,
  newsletterSchema,
  volunteerSchema,
} from "./validation";

describe("public API validation", () => {
  it("normalizes a valid contact submission", () => {
    const result = contactSchema.parse({
      name: "  Ananya Rao  ",
      email: "ANANYA@EXAMPLE.ORG",
      subject: "Program partnership",
      message:
        "I would like to explore a partnership with your education program.",
      consent: true,
    });

    expect(result.name).toBe("Ananya Rao");
    expect(result.email).toBe("ananya@example.org");
    expect(result.website).toBe("");
  });

  it("rejects control characters and bot honeypot values", () => {
    const result = contactSchema.safeParse({
      name: "Ananya Rao",
      email: "ananya@example.org",
      subject: "Hello\r\nBcc: attacker@example.org",
      message: "This body is otherwise long enough to pass validation.",
      consent: true,
      website: "https://spam.invalid",
    });

    expect(result.success).toBe(false);
  });

  it("defaults newsletter source after a blank value", () => {
    const result = newsletterSchema.parse({
      email: "reader@example.org",
      source: "",
      consent: true,
    });

    expect(result.source).toBe("website");
  });

  it("accepts numeric donation strings but rejects unsupported Razorpay recurrence", () => {
    const valid = donationSchema.parse({
      amount: "2500.50",
      currency: "INR",
      frequency: "one_time",
      provider: "auto",
      donor: { name: "Arjun Mehta", email: "arjun@example.org" },
      consent: true,
    });
    expect(valid.amount).toBe(2500.5);

    const invalid = donationSchema.safeParse({
      ...valid,
      provider: "razorpay",
      frequency: "monthly",
    });
    expect(invalid.success).toBe(false);
  });

  it("applies safe volunteer defaults", () => {
    const result = volunteerSchema.parse({
      name: "Mira Sen",
      email: "mira@example.org",
      phone: "+91 98765 43210",
      city: "Bengaluru",
      areaOfInterest: "Education",
      availability: "weekends",
      motivation:
        "I want to contribute my teaching experience to community-led programs.",
      consent: true,
    });

    expect(result.country).toBe("India");
    expect(result.skills).toEqual([]);
  });
});
