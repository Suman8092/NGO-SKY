import { Resend } from "resend";

import { getServerEnv, hasResendConfig } from "../env";
import type { DonationRecord } from "../repository";
import type { ContactInput, NewsletterInput, VolunteerInput } from "../validation";

export type EmailDeliverySummary = {
  status: "sent" | "partial" | "skipped" | "failed";
  delivered: number;
  attempted: number;
};

let resendClient: Resend | undefined;

function client(): Resend | null {
  const env = getServerEnv();
  if (!hasResendConfig() || !env.RESEND_API_KEY) return null;
  resendClient ??= new Resend(env.RESEND_API_KEY);
  return resendClient;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character] ?? character;
  });
}

async function deliver(messages: Array<{ to: string; subject: string; html: string; key: string }>): Promise<EmailDeliverySummary> {
  const resend = client();
  const from = getServerEnv().RESEND_FROM_EMAIL;
  if (!resend || !from || messages.length === 0) return { status: "skipped", delivered: 0, attempted: 0 };

  const outcomes = await Promise.allSettled(
    messages.map((message) =>
      resend.emails.send(
        { from, to: message.to, subject: message.subject, html: message.html },
        { headers: { "Idempotency-Key": message.key } },
      ),
    ),
  );
  const delivered = outcomes.filter(
    (outcome) => outcome.status === "fulfilled" && !outcome.value.error && Boolean(outcome.value.data?.id),
  ).length;
  return {
    status: delivered === messages.length ? "sent" : delivered > 0 ? "partial" : "failed",
    delivered,
    attempted: messages.length,
  };
}

export function sendContactAcknowledgements(
  input: ContactInput,
  submissionId: string,
): Promise<EmailDeliverySummary> {
  const admin = getServerEnv().CONTACT_NOTIFICATION_EMAIL;
  const messages = [
    {
      to: input.email,
      subject: "We received your message",
      key: `contact-ack-${submissionId}`,
      html: `<p>Hello ${escapeHtml(input.name)},</p><p>Thank you for contacting Ashaaya Foundation. Our team has received your message and will respond as soon as possible.</p><p>Reference: ${escapeHtml(submissionId)}</p>`,
    },
    ...(admin
      ? [
          {
            to: admin,
            subject: `Website enquiry: ${input.subject}`,
            key: `contact-admin-${submissionId}`,
            html: `<p><strong>From:</strong> ${escapeHtml(input.name)} (${escapeHtml(input.email)})</p><p><strong>Subject:</strong> ${escapeHtml(input.subject)}</p><p>${escapeHtml(input.message).replace(/\n/g, "<br>")}</p>`,
          },
        ]
      : []),
  ];
  return deliver(messages);
}

export function sendNewsletterWelcome(
  input: NewsletterInput,
  subscriptionId: string,
): Promise<EmailDeliverySummary> {
  return deliver([
    {
      to: input.email,
      subject: "Welcome to the Ashaaya Foundation community",
      key: `newsletter-welcome-${subscriptionId}`,
      html: `<p>Hello${input.name ? ` ${escapeHtml(input.name)}` : ""},</p><p>Thank you for joining our impact newsletter. You will receive thoughtful updates about programs, field stories, and ways to help.</p>`,
    },
  ]);
}

export function sendVolunteerAcknowledgements(
  input: VolunteerInput,
  applicationId: string,
): Promise<EmailDeliverySummary> {
  const admin = getServerEnv().CONTACT_NOTIFICATION_EMAIL;
  const messages = [
    {
      to: input.email,
      subject: "Your volunteer application is in",
      key: `volunteer-ack-${applicationId}`,
      html: `<p>Hello ${escapeHtml(input.name)},</p><p>We received your volunteer application for ${escapeHtml(input.areaOfInterest)}. Our team will review it and contact you if there is a suitable opportunity.</p><p>Reference: ${escapeHtml(applicationId)}</p>`,
    },
    ...(admin
      ? [
          {
            to: admin,
            subject: `New volunteer application: ${input.areaOfInterest}`,
            key: `volunteer-admin-${applicationId}`,
            html: `<p><strong>Applicant:</strong> ${escapeHtml(input.name)} (${escapeHtml(input.email)})</p><p><strong>Location:</strong> ${escapeHtml(input.city)}, ${escapeHtml(input.country)}</p><p><strong>Availability:</strong> ${escapeHtml(input.availability)}</p>`,
          },
        ]
      : []),
  ];
  return deliver(messages);
}

export function sendDonationConfirmation(donation: DonationRecord): Promise<EmailDeliverySummary> {
  const amount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: donation.currency,
    minimumFractionDigits: 2,
  }).format(donation.amountMinor / 100);
  return deliver([
    {
      to: donation.donor.email,
      subject: "Your donation payment is confirmed",
      key: `donation-confirmation-${donation.id}`,
      html: `<p>Hello ${escapeHtml(donation.donor.name)},</p><p>Thank you. Your ${escapeHtml(amount)} donation to Ashaaya Foundation has been confirmed.</p><p>Reference: ${escapeHtml(donation.id)}</p><p>Please keep this reference for your records. Our giving team will send any applicable tax documentation separately.</p>`,
    },
  ]);
}
