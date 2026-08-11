export const contactSubjectOptions = [
  "General enquiry",
  "Partnerships",
  "Donation support",
  "Campaign support",
  "Volunteering",
  "Events",
  "Media & speaking",
  "Safeguarding concern",
  "Accessibility support",
  "Impact and data",
] as const;

export type ContactSubject = (typeof contactSubjectOptions)[number];

const subjectAliases: Record<string, ContactSubject> = {
  general: "General enquiry",
  partnership: "Partnerships",
  partnerships: "Partnerships",
  donations: "Donation support",
  "donation-support": "Donation support",
  "donations-receipts": "Donation support",
  "donor-support": "Donation support",
  "campaign-support": "Campaign support",
  skills: "Volunteering",
  volunteering: "Volunteering",
  events: "Events",
  "event-resource": "Events",
  "event-updates": "Events",
  media: "Media & speaking",
  safeguarding: "Safeguarding concern",
  accessibility: "Accessibility support",
  impact: "Impact and data",
  "impact-report": "Impact and data",
  data: "Impact and data",
  "data-question": "Impact and data",
};

export function resolveContactSubject(value?: string): ContactSubject {
  const normalized = value?.trim().toLowerCase() ?? "";
  return subjectAliases[normalized] ?? "General enquiry";
}
