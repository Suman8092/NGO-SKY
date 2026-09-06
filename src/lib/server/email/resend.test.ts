import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getVerifiedSiteOrigin: vi.fn(),
  send: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.send };
  },
}));
vi.mock("../env", () => ({
  getServerEnv: () => ({
    RESEND_API_KEY: "re_test_key",
    RESEND_FROM_EMAIL: "Skymeredian Foundation <updates@example.org>",
  }),
  getVerifiedSiteOrigin: mocks.getVerifiedSiteOrigin,
  hasResendConfig: () => true,
}));

import { sendNewsletterWelcome } from "./resend";

const input = {
  email: "reader@example.org",
  source: "website",
  consent: true as const,
  website: "",
};

beforeEach(() => {
  mocks.getVerifiedSiteOrigin.mockReset().mockReturnValue("https://ngo.example");
  mocks.send.mockReset().mockResolvedValue({
    data: { id: "email_123" },
    error: null,
  });
});

describe("newsletter email lifecycle", () => {
  it("includes the bearer in a real unsubscribe URL without dummy claims", async () => {
    const token = "a".repeat(43);

    await expect(
      sendNewsletterWelcome(
        input,
        "64b64b64b64b64b64b64b64b",
        token,
      ),
    ).resolves.toMatchObject({ status: "sent", delivered: 1 });

    const message = mocks.send.mock.calls[0]?.[0] as {
      headers?: Record<string, string>;
      html: string;
      subject: string;
      text?: string;
    };
    expect(message.html).toContain(
      `https://ngo.example/newsletter/unsubscribe?token=${token}`,
    );
    expect(message.html).not.toMatch(/programs|field stories|impact newsletter/i);
    expect(message.subject).toContain("email updates");
    expect(message.text).toContain(
      `https://ngo.example/newsletter/unsubscribe?token=${token}`,
    );
    expect(message.text).not.toMatch(/programs|field stories|impact newsletter/i);
    expect(message.headers).toEqual({
      "List-Unsubscribe": `<https://ngo.example/newsletter/unsubscribe?token=${token}>`,
    });
    expect(message.headers).not.toHaveProperty("List-Unsubscribe-Post");
  });

  it("does not send a message without a verified site origin", async () => {
    mocks.getVerifiedSiteOrigin.mockReturnValue(null);

    await expect(
      sendNewsletterWelcome(
        input,
        "64b64b64b64b64b64b64b64b",
        "a".repeat(43),
      ),
    ).resolves.toEqual({ status: "skipped", delivered: 0, attempted: 0 });
    expect(mocks.send).not.toHaveBeenCalled();
  });
});
