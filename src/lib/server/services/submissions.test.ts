import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  hasManagedSubmissionWorkflow: vi.fn(),
  isNewsletterWorkflowEnabled: vi.fn(),
  sendNewsletterWelcome: vi.fn(),
  storeNewsletterSubscription: vi.fn(),
  unsubscribeNewsletterSubscription: vi.fn(),
}));

vi.mock("../env", () => ({
  hasManagedSubmissionWorkflow: mocks.hasManagedSubmissionWorkflow,
  isNewsletterWorkflowEnabled: mocks.isNewsletterWorkflowEnabled,
}));
vi.mock("../email/resend", () => ({
  sendContactAcknowledgements: vi.fn(),
  sendNewsletterWelcome: mocks.sendNewsletterWelcome,
  sendVolunteerAcknowledgements: vi.fn(),
}));
vi.mock("../repository", () => ({
  storeContact: vi.fn(),
  storeNewsletterSubscription: mocks.storeNewsletterSubscription,
  storeVolunteerApplication: vi.fn(),
  unsubscribeNewsletterSubscription: mocks.unsubscribeNewsletterSubscription,
}));

import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
} from "./submissions";

const input = {
  email: "reader@example.org",
  source: "website",
  consent: true as const,
  website: "",
};
const metadata = { requestId: "req-service-test" };
const skippedEmail = {
  status: "skipped",
  delivered: 0,
  attempted: 0,
};

beforeEach(() => {
  mocks.hasManagedSubmissionWorkflow.mockReset().mockReturnValue(false);
  mocks.isNewsletterWorkflowEnabled.mockReset().mockReturnValue(true);
  mocks.sendNewsletterWelcome.mockReset().mockResolvedValue({
    status: "sent",
    delivered: 1,
    attempted: 1,
  });
  mocks.storeNewsletterSubscription.mockReset();
  mocks.unsubscribeNewsletterSubscription.mockReset();
});

describe("newsletter submission service", () => {
  it("emails a newly issued link without returning the bearer token", async () => {
    const token = "a".repeat(43);
    mocks.storeNewsletterSubscription.mockResolvedValue({
      record: {
        id: "64b64b64b64b64b64b64b64b",
        status: "active",
        subscribedAt: "2026-08-11T10:00:00.000Z",
      },
      persistence: "mongodb",
      created: false,
      unsubscribeToken: token,
    });

    const result = await subscribeToNewsletter(input, metadata);

    expect(mocks.sendNewsletterWelcome).toHaveBeenCalledWith(
      input,
      "64b64b64b64b64b64b64b64b",
      token,
    );
    expect(result).not.toHaveProperty("unsubscribeToken");
    expect(result.email.status).toBe("sent");
  });

  it("does not resend when an active row already has a stored token hash", async () => {
    mocks.storeNewsletterSubscription.mockResolvedValue({
      record: {
        id: "64b64b64b64b64b64b64b64b",
        status: "active",
        subscribedAt: "2026-08-11T10:00:00.000Z",
      },
      persistence: "mongodb",
      created: false,
    });

    const result = await subscribeToNewsletter(input, metadata);

    expect(mocks.sendNewsletterWelcome).not.toHaveBeenCalled();
    expect(result.email).toEqual(skippedEmail);
  });

  it("keeps unsubscribe available when the public signup gate is off", async () => {
    mocks.isNewsletterWorkflowEnabled.mockReturnValue(false);
    mocks.unsubscribeNewsletterSubscription.mockResolvedValue("unsubscribed");

    await expect(unsubscribeFromNewsletter("a".repeat(43))).resolves.toBe(
      "unsubscribed",
    );
    expect(mocks.unsubscribeNewsletterSubscription).toHaveBeenCalledOnce();
  });
});
