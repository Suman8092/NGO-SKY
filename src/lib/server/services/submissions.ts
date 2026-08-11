import {
  sendContactAcknowledgements,
  sendNewsletterWelcome,
  sendVolunteerAcknowledgements,
  type EmailDeliverySummary,
} from "../email/resend";
import {
  storeContact,
  storeNewsletterSubscription,
  storeVolunteerApplication,
  type RequestMetadata,
} from "../repository";
import {
  hasManagedSubmissionWorkflow,
  isPublicSubmissionsEnabled,
} from "../env";
import { ApiError } from "../errors";
import type {
  ContactInput,
  NewsletterInput,
  VolunteerInput,
} from "../validation";

const skippedEmail: EmailDeliverySummary = {
  status: "skipped",
  delivered: 0,
  attempted: 0,
};

export function assertSubmissionWorkflow(
  kind: "contact" | "newsletter" | "volunteer",
) {
  const available =
    kind === "newsletter"
      ? isPublicSubmissionsEnabled()
      : hasManagedSubmissionWorkflow();
  if (available) return;
  throw new ApiError(
    503,
    "SUBMISSIONS_DISABLED",
    "This form is not currently accepting submissions.",
    { retryAfter: 300 },
  );
}

export async function submitContact(
  input: ContactInput,
  metadata: RequestMetadata,
) {
  assertSubmissionWorkflow("contact");
  const stored = await storeContact(input, metadata);
  const email =
    stored.persistence === "mongodb"
      ? await sendContactAcknowledgements(input, stored.record.id)
      : skippedEmail;
  return { ...stored, email };
}

export async function subscribeToNewsletter(
  input: NewsletterInput,
  metadata: RequestMetadata,
) {
  assertSubmissionWorkflow("newsletter");
  const stored = await storeNewsletterSubscription(input, metadata);
  const email =
    stored.persistence === "mongodb" && stored.created
      ? await sendNewsletterWelcome(input, stored.record.id)
      : skippedEmail;
  return { ...stored, email };
}

export async function submitVolunteerApplication(
  input: VolunteerInput,
  metadata: RequestMetadata,
) {
  assertSubmissionWorkflow("volunteer");
  const stored = await storeVolunteerApplication(input, metadata);
  const email =
    stored.persistence === "mongodb"
      ? await sendVolunteerAcknowledgements(input, stored.record.id)
      : skippedEmail;
  return { ...stored, email };
}
