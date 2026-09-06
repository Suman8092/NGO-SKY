import { Resend } from "resend";

import {
  getServerEnv,
  getVerifiedSiteOrigin,
  hasResendConfig,
} from "../env";
import {
  hashNewsletterUnsubscribeToken,
  isNewsletterUnsubscribeToken,
} from "../newsletter-tokens";
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

function resolveSender(configuredFrom: string | undefined): string | null {
  if (!configuredFrom) return null;
  const trimmed = configuredFrom.trim();
  if (/@(gmail|yahoo|outlook|hotmail)\.com$/i.test(trimmed)) {
    return "Skymeredian Foundation <onboarding@resend.dev>";
  }
  return trimmed;
}
async function deliver(
  messages: Array<{
    to: string;
    subject: string;
    html: string;
    text?: string;
    headers?: Record<string, string>;
    key: string;
  }>,
): Promise<EmailDeliverySummary> {
  const resend = client();
  const rawFrom = getServerEnv().RESEND_FROM_EMAIL;
  const from = resolveSender(rawFrom);
  if (!resend || !from || messages.length === 0) return { status: "skipped", delivered: 0, attempted: 0 };

  const outcomes = await Promise.allSettled(
    messages.map((message) =>
      resend.emails.send(
        {
          from,
          to: message.to,
          subject: message.subject,
          html: message.html,
          text: message.text,
          headers: message.headers,
        },
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
      html: `<p>Hello ${escapeHtml(input.name)},</p><p>Thank you for contacting Skymeredian Foundation. Our team has received your message and will respond as soon as possible.</p><p>Reference: ${escapeHtml(submissionId)}</p>`,
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
  unsubscribeToken: string,
): Promise<EmailDeliverySummary> {
  const origin = getVerifiedSiteOrigin();
  if (!origin || !isNewsletterUnsubscribeToken(unsubscribeToken)) {
    return Promise.resolve({
      status: "skipped",
      delivered: 0,
      attempted: 0,
    });
  }

  const unsubscribeUrl = new URL("/newsletter/unsubscribe", origin);
  unsubscribeUrl.searchParams.set("token", unsubscribeToken);
  const tokenFingerprint = hashNewsletterUnsubscribeToken(
    unsubscribeToken,
  ).slice(0, 16);
  const unsubscribeHref = unsubscribeUrl.toString();
  const greeting = `Hello${input.name ? ` ${input.name}` : ""},`;

  return deliver([
    {
      to: input.email,
      subject: "Your Skymeredian Foundation email updates",
      key: `newsletter-welcome-${subscriptionId}-${tokenFingerprint}`,
      html: `<p>Hello${input.name ? ` ${escapeHtml(input.name)}` : ""},</p><p>This confirms that this address is subscribed to Skymeredian Foundation email updates.</p><p>You can stop these emails at any time by using this secure link: <a href="${escapeHtml(unsubscribeHref)}">unsubscribe from email updates</a>.</p><p>If you did not request this, use the same link to unsubscribe.</p>`,
      text: `${greeting}\n\nThis confirms that this address is subscribed to Skymeredian Foundation email updates.\n\nYou can stop these emails at any time using this secure link:\n${unsubscribeHref}\n\nIf you did not request this, use the same link to unsubscribe.`,
      headers: { "List-Unsubscribe": `<${unsubscribeHref}>` },
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
      subject: "Donation payment status confirmed",
      key: `donation-confirmation-${donation.id}`,
      html: `<p>Hello ${escapeHtml(donation.donor.name)},</p><p>The payment provider has confirmed your ${escapeHtml(amount)} donation payment.</p><p>Reference: ${escapeHtml(donation.id)}</p><p>Please keep this reference for your records.</p>`,
    },
  ]);
}
