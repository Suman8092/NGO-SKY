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
import type { ContactInput, NewsletterInput, VolunteerInput } from "../validation";

const skippedEmail: EmailDeliverySummary = { status: "skipped", delivered: 0, attempted: 0 };

export async function submitContact(input: ContactInput, metadata: RequestMetadata) {
  const stored = await storeContact(input, metadata);
  const email =
    stored.persistence === "mongodb"
      ? await sendContactAcknowledgements(input, stored.record.id)
      : skippedEmail;
  return { ...stored, email };
}

export async function subscribeToNewsletter(input: NewsletterInput, metadata: RequestMetadata) {
  const stored = await storeNewsletterSubscription(input, metadata);
  const email =
    stored.persistence === "mongodb" && stored.created
      ? await sendNewsletterWelcome(input, stored.record.id)
      : skippedEmail;
  return { ...stored, email };
}

export async function submitVolunteerApplication(input: VolunteerInput, metadata: RequestMetadata) {
  const stored = await storeVolunteerApplication(input, metadata);
  const email =
    stored.persistence === "mongodb"
      ? await sendVolunteerAcknowledgements(input, stored.record.id)
      : skippedEmail;
  return { ...stored, email };
}
