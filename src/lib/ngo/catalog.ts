export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "date"
  | "number"
  | "money"
  | "select"
  | "checkbox"
  | "image"
  | "file";
export type ModuleField = {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  options?: string[];
  reference?: string;
  hint?: string;
};
export type ModuleDefinition = {
  title: string;
  singular: string;
  description: string;
  group: string;
  fields: ModuleField[];
  statuses: string[];
  public?: boolean;
  coordinator?: boolean;
  readOnly?: boolean;
};
const f = (
  key: string,
  label: string,
  type: FieldType = "text",
  required = false,
  options?: string[],
  reference?: string,
): ModuleField => ({ key, label, type, required, options, reference });
const person = [
  f("name", "Full name", "text", true),
  f("email", "Email", "email", true),
  f("phone", "Mobile", "tel"),
];
const dates = [
  f("startDate", "Start date", "date", true),
  f("endDate", "End date", "date"),
];
const payment = [
  f("amount", "Amount (INR)", "money", true),
  f("date", "Payment date", "date", true),
  f("method", "Payment method", "select", true, [
    "cash",
    "bank",
    "upi",
    "cheque",
    "other",
  ]),
  f("transaction", "Transaction / bank reference"),
  f("proof", "Supporting document", "file"),
];
export const modules = {
  "tax-approvals": {
    title: "80G organization approvals",
    singular: "tax approval",
    group: "Administration",
    description:
      "Record genuine approval evidence and its validity. Activation requires the real organization profile. This enables approval details on eligible monetary donation acknowledgements; it does not file Form 10BD or generate an Income Tax Department Form 10BE.",
    statuses: ["draft", "active", "expired", "revoked"],
    fields: [
      f("name", "Approval description", "text", true),
      f("pan", "Organization PAN", "text", true),
      f(
        "approvalNumber",
        "Approval / unique registration number",
        "text",
        true,
      ),
      f("startDate", "Approval valid from", "date", true),
      f("endDate", "Approval valid until", "date", true),
      f("proof", "Official approval evidence", "file", true),
      f(
        "verified",
        "I verified the genuine approval and organization eligibility",
        "checkbox",
        true,
      ),
    ],
  },
  "gateway-payments": {
    title: "Gateway payment reconciliation",
    singular: "gateway transaction",
    group: "Finance",
    readOnly: true,
    description:
      "Provider orders for registration fees and hosted donations. Refresh a transaction to reconcile its server-confirmed status.",
    statuses: ["pending", "paid", "failed", "setup-failed"],
    fields: [
      f("name", "Payer"),
      f("email", "Email"),
      f("provider", "Gateway"),
      f("amountMinor", "Expected amount (paise)", "number"),
      f("sourceModule", "Registration type"),
      f("source", "Source reference"),
      f("paymentId", "Provider payment ID"),
    ],
  },
  gateways: {
    title: "Payment gateway selection",
    singular: "gateway configuration",
    group: "Administration",
    description:
      "Activate a configured provider for new donations and registration fees. Existing orders retain their original provider. Merchant secrets are server environment variables; they are never exposed in this form. Recurring mandates continue through Razorpay.",
    statuses: ["inactive", "active"],
    fields: [
      f("name", "Configuration name", "text", true),
      f("provider", "Provider", "select", true, [
        "razorpay",
        "phonepe",
        "payu",
      ]),
      f("environment", "Environment", "select", true, [
        "production",
        "sandbox",
      ]),
    ],
  },
  "member-referrals": {
    title: "Member referral performance",
    singular: "referral report",
    description:
      "Membership and net confirmed donation referrals per member. Date filters apply to referred registrations and contributions.",
    group: "Reports",
    readOnly: true,
    statuses: ["pending", "approved", "expired", "blocked", "rejected"],
    fields: [
      f("name", "Member"),
      f("members", "Referred members", "number"),
      f("amount", "Referred donations (INR)", "money"),
      f("donors", "Unique referred donors", "number"),
    ],
  },
  "campaign-analytics": {
    title: "Campaign analytics",
    singular: "campaign report",
    description:
      "Confirmed net collection, unique donors and remaining goal for every campaign.",
    group: "Reports",
    readOnly: true,
    statuses: ["draft", "active", "completed", "archived"],
    fields: [
      f("name", "Campaign"),
      f("amount", "Confirmed collection (INR)", "money"),
      f("goal", "Goal (INR)", "money"),
      f("remaining", "Remaining goal (INR)", "money"),
      f("donors", "Unique donors", "number"),
      f("progress", "Goal progress (%)", "number"),
    ],
  },
  organization: {
    title: "Organization letterhead profile",
    singular: "organization profile",
    group: "Administration",
    description:
      "The legal identity, registered address, and contact information printed on newly issued documents. Only one active profile is permitted.",
    statuses: ["active", "inactive"],
    fields: [
      f("name", "Legal organization name", "text", true),
      f("address", "Registered office address", "textarea", true),
      f("email", "Official email", "email", true),
      f("phone", "Official phone", "tel", true),
      f("registration", "Registration number"),
      f("signatory", "Authorized signatory", "text", true),
    ],
  },
  "online-donations": {
    title: "Online donations & payment states",
    singular: "online donation",
    group: "Finance",
    description:
      "Provider-confirmed online transactions, with pending, paid, failed, refunded, and cancelled states.",
    statuses: [
      "pending",
      "processing",
      "paid",
      "failed",
      "refunded",
      "cancelled",
    ],
    readOnly: true,
    fields: [
      f("name", "Donor name"),
      f("email", "Email", "email"),
      f("phone", "Mobile", "tel"),
      f("amount", "Amount", "money"),
      f("currency", "Currency"),
      f("provider", "Gateway"),
      f("transaction", "Payment reference"),
      f("frequency", "Frequency"),
      f("date", "Date", "date"),
    ],
  },
  designations: {
    title: "Designations & fees",
    singular: "designation",
    group: "Membership",
    description: "Define membership positions and their registration fees.",
    statuses: ["active", "inactive"],
    public: true,
    fields: [
      f("name", "Designation", "text", true),
      f("fee", "Membership fee (INR)", "money", true),
      f("description", "Eligibility / description", "textarea"),
      f("termMonths", "Term in months", "number", true),
      f("provisional", "Provisional / testing category", "checkbox"),
    ],
  },
  members: {
    title: "Members",
    singular: "member",
    group: "Membership",
    description:
      "Review applications, payments, referrals, and membership status. Approval never implies an unverified payment.",
    statuses: ["pending", "approved", "blocked", "rejected", "expired"],
    coordinator: true,
    fields: [
      ...person,
      f("accountUserId", "Clerk account ID"),
      f(
        "designation",
        "Designation reference",
        "text",
        true,
        undefined,
        "designations",
      ),
      f("dateOfBirth", "Date of birth", "date"),
      f("address", "Address", "textarea"),
      f("photo", "Member photo", "image"),
      f(
        "referredBy",
        "Referring member reference",
        "text",
        false,
        undefined,
        "members",
      ),
      f(
        "coordinator",
        "Coordinator reference",
        "text",
        false,
        undefined,
        "coordinators",
      ),
      f(
        "validUntil",
        "Administrative validity correction (review notes required)",
        "date",
      ),
      f("notes", "Review notes", "textarea"),
    ],
  },
  renewals: {
    title: "Membership renewals",
    singular: "renewal",
    group: "Membership",
    description:
      "Renew membership against a new fee and term snapshot. Payment and administrative approval are required before extending validity.",
    statuses: ["pending", "approved", "rejected", "cancelled"],
    fields: [
      f("name", "Member name", "text", true),
      f("email", "Email", "email", true),
      f("member", "Member reference", "text", true, undefined, "members"),
      f(
        "designation",
        "Renewal designation",
        "text",
        true,
        undefined,
        "designations",
      ),
      f("notes", "Review notes", "textarea"),
    ],
  },
  team: {
    title: "Management body",
    singular: "team member",
    group: "Publishing",
    description:
      "Publish the management body, core team, and executive members on the website.",
    statuses: ["draft", "published", "archived"],
    public: true,
    fields: [
      f("name", "Full name", "text", true),
      f("designation", "Position", "text", true),
      f("group", "Team", "select", true, [
        "Management body",
        "Core team",
        "Executive members",
      ]),
      f("photo", "Photograph", "image"),
      f("bio", "Short biography", "textarea", true),
      f("order", "Display order", "number"),
    ],
  },
  "offline-donations": {
    title: "Cash, bank & UPI donations",
    singular: "donation",
    group: "Finance",
    description:
      "Record externally received donations. Coordinators submit for finance review; receipts are issued only after confirmation.",
    statuses: ["pending", "confirmed", "void"],
    coordinator: true,
    fields: [
      ...person,
      ...payment,
      f("purpose", "Purpose", "textarea", true),
      f(
        "campaign",
        "Campaign reference",
        "text",
        false,
        undefined,
        "campaigns",
      ),
      f("project", "Project reference", "text", false, undefined, "projects"),
      f(
        "referredBy",
        "Referring member reference",
        "text",
        false,
        undefined,
        "members",
      ),
      f(
        "coordinator",
        "Coordinator reference",
        "text",
        false,
        undefined,
        "coordinators",
      ),
    ],
  },
  "in-kind": {
    title: "Item donations",
    singular: "item donation",
    group: "Finance",
    description:
      "Inventory donations of clothing, food, books, medicines, equipment, and other goods.",
    statuses: ["pending", "received", "distributed", "void"],
    coordinator: true,
    fields: [
      ...person,
      f("item", "Item name", "text", true),
      f("category", "Category", "select", true, [
        "Clothing",
        "Food",
        "Books",
        "Medicine",
        "Stationery",
        "Blankets",
        "Wheelchair",
        "Other",
      ]),
      f("quantity", "Quantity", "number", true),
      f("unit", "Unit", "text", true),
      f("estimatedValue", "Estimated value (INR)", "money"),
      f("date", "Donation date", "date", true),
      f("notes", "Condition / distribution notes", "textarea"),
      f(
        "coordinator",
        "Coordinator reference",
        "text",
        false,
        undefined,
        "coordinators",
      ),
    ],
  },
  coordinators: {
    title: "Coordinators",
    singular: "coordinator",
    group: "People",
    description:
      "Grant a named Clerk account a coordinator workspace with access to its own field records.",
    statuses: ["active", "blocked"],
    fields: [
      ...person,
      f("accountUserId", "Clerk account ID", "text", true),
      f("location", "Assigned area", "text", true),
      f("notes", "Responsibilities", "textarea"),
    ],
  },
  beneficiaries: {
    title: "Beneficiaries",
    singular: "beneficiary",
    group: "People",
    description:
      "Confidential beneficiary records, restricted to authorized staff and the assigned coordinator.",
    statuses: ["active", "inactive"],
    coordinator: true,
    fields: [
      f("name", "Full name", "text", true),
      f("phone", "Mobile", "tel"),
      f("address", "Address", "textarea", true),
      f("location", "Location", "text", true),
      f("needs", "Assistance needs", "textarea", true),
      f("consent", "Consent recorded", "checkbox", true),
      f(
        "coordinator",
        "Coordinator reference",
        "text",
        false,
        undefined,
        "coordinators",
      ),
    ],
  },
  assistance: {
    title: "Assistance history",
    singular: "assistance entry",
    group: "People",
    description: "Record what assistance was delivered, when, and to whom.",
    statuses: ["planned", "delivered", "cancelled"],
    coordinator: true,
    fields: [
      f("name", "Assistance summary", "text", true),
      f(
        "beneficiary",
        "Beneficiary reference",
        "text",
        true,
        undefined,
        "beneficiaries",
      ),
      f("date", "Date", "date", true),
      f("category", "Assistance type", "text", true),
      f("quantity", "Quantity", "number"),
      f("value", "Value (INR)", "money"),
      f("project", "Project reference", "text", false, undefined, "projects"),
      f("notes", "Delivery notes", "textarea"),
    ],
  },
  campaigns: {
    title: "Fundraising campaigns",
    singular: "campaign",
    group: "Publishing",
    description:
      "Publish campaigns with dated goals and progress calculated from confirmed contributions.",
    statuses: ["draft", "active", "completed", "archived"],
    public: true,
    fields: [
      f("name", "Campaign title", "text", true),
      f("description", "Purpose and description", "textarea", true),
      f("image", "Campaign image", "image"),
      f("goal", "Goal (INR)", "money", true),
      ...dates,
      f("project", "Project reference", "text", false, undefined, "projects"),
    ],
  },
  activities: {
    title: "Activity feed",
    singular: "activity",
    group: "Publishing",
    description: "Publish photographs and captions from real field activities.",
    statuses: ["draft", "published", "archived"],
    public: true,
    fields: [
      f("name", "Activity title", "text", true),
      f("description", "Caption", "textarea", true),
      f("image", "Photograph", "image"),
      f("date", "Activity date", "date", true),
      f("location", "Location"),
    ],
  },
  projects: {
    title: "Projects",
    singular: "project",
    group: "Operations",
    description:
      "Track project schedules, delivery progress, income, and expenditure.",
    statuses: ["planned", "active", "completed", "on-hold", "archived"],
    public: true,
    fields: [
      f("name", "Project name", "text", true),
      f("description", "Description", "textarea", true),
      ...dates,
      f("progress", "Progress (%)", "number", true),
      f("location", "Location"),
      f("publish", "Publish project summary", "checkbox"),
    ],
  },
  "project-funds": {
    title: "Project income",
    singular: "income entry",
    group: "Finance",
    description:
      "Record non-donation project income. Donations linked to projects are counted separately to avoid double counting.",
    statuses: ["pending", "confirmed", "void"],
    fields: [
      f("name", "Income source", "text", true),
      f("project", "Project reference", "text", true, undefined, "projects"),
      ...payment,
      f("notes", "Description", "textarea"),
    ],
  },
  events: {
    title: "Event publishing",
    singular: "event",
    group: "Operations",
    description:
      "Manage camps and events, participant limits, registration dates, venues, and fees.",
    statuses: ["draft", "published", "completed", "cancelled"],
    public: true,
    fields: [
      f("name", "Event title", "text", true),
      f("description", "Details", "textarea", true),
      ...dates,
      f("time", "Timing", "text", true),
      f("location", "Venue", "text", true),
      f("fee", "Registration fee (INR)", "money", true),
      f("capacity", "Capacity", "number", true),
      f("image", "Event image", "image"),
    ],
  },
  registrations: {
    title: "Event participants",
    singular: "registration",
    group: "Operations",
    description:
      "Registration, fee reconciliation, attendance, and event receipts.",
    statuses: ["registered", "attended", "cancelled"],
    fields: [
      ...person,
      f("accountUserId", "Clerk account ID"),
      f("event", "Event reference", "text", true, undefined, "events"),
      f("notes", "Access / special requirements", "textarea"),
    ],
  },
  internships: {
    title: "Internship programs",
    singular: "internship",
    group: "Operations",
    description: "Publish internship programs, application windows, and fees.",
    statuses: ["draft", "open", "closed", "completed"],
    public: true,
    fields: [
      f("name", "Program title", "text", true),
      f("description", "Program details", "textarea", true),
      ...dates,
      f("fee", "Program fee (INR)", "money", true),
      f("location", "Location / remote"),
      f("requirements", "Eligibility", "textarea"),
    ],
  },
  applications: {
    title: "Internship applications",
    singular: "application",
    group: "Operations",
    description:
      "Review student applications, completion status, and certificate eligibility.",
    statuses: ["submitted", "reviewing", "accepted", "completed", "rejected"],
    fields: [
      ...person,
      f("accountUserId", "Clerk account ID"),
      f(
        "internship",
        "Internship reference",
        "text",
        true,
        undefined,
        "internships",
      ),
      f("education", "Education", "text", true),
      f("motivation", "Motivation", "textarea", true),
      f("resume", "Resume", "file"),
    ],
  },
  expenses: {
    title: "Expenses",
    singular: "expense",
    group: "Finance",
    description:
      "Record bills, categories, projects, dates, and approved expenditure.",
    statuses: ["pending", "approved", "void"],
    fields: [
      f("name", "Purpose", "text", true),
      f("category", "Category", "select", true, [
        "Travel",
        "Events",
        "Utilities",
        "Staff",
        "Office",
        "Project",
        "Other",
      ]),
      f("amount", "Amount (INR)", "money", true),
      f("date", "Expense date", "date", true),
      f("payee", "Paid to", "text", true),
      f("project", "Project reference", "text", false, undefined, "projects"),
      f("bill", "Bill / document", "file"),
      f("notes", "Notes", "textarea"),
    ],
  },
  certificates: {
    title: "Certificates & ID cards",
    singular: "certificate",
    group: "Documents",
    description:
      "Issue membership, achievement, visitor, and internship documents with revocable QR verification.",
    statuses: ["draft", "issued", "revoked"],
    fields: [
      f("name", "Recipient name", "text", true),
      f("email", "Recipient email", "email", true),
      f("member", "Member reference", "text", false, undefined, "members"),
      f(
        "application",
        "Completed internship application",
        "text",
        false,
        undefined,
        "applications",
      ),
      f("type", "Document type", "select", true, [
        "membership-certificate",
        "achievement",
        "visitor-certificate",
        "internship-certificate",
        "id-card",
        "appointment",
      ]),
      f("title", "Certificate title", "text", true),
      f("content", "Citation / appointment details", "textarea", true),
      f("date", "Issue date", "date", true),
      f("expiry", "Valid until", "date"),
      f("template", "Template", "select", true, [
        "classic",
        "modern",
        "heritage",
        "minimal",
        "honour",
        "executive",
      ]),
      f("signatory", "Authorized signatory", "text"),
      f("sendEmail", "Email on issue", "checkbox"),
    ],
  },
  letters: {
    title: "Official letters",
    singular: "letter",
    group: "Documents",
    description:
      "Prepare, preview, issue, and retain official correspondence on the foundation letterhead.",
    statuses: ["draft", "issued", "revoked"],
    fields: [
      ...person,
      f("title", "Subject", "text", true),
      f("content", "Letter content", "textarea", true),
      f("date", "Date", "date", true),
      f("signatory", "Authorized signatory", "text"),
      f("sendEmail", "Email on issue", "checkbox"),
    ],
  },
  news: {
    title: "News & updates",
    singular: "news item",
    group: "Publishing",
    description:
      "Publish dated announcements on the public website and member dashboard.",
    statuses: ["draft", "published", "archived"],
    public: true,
    fields: [
      f("name", "Headline", "text", true),
      f("description", "News content", "textarea", true),
      f("image", "News image", "image"),
      f("date", "Publication date", "date", true),
    ],
  },
  complaints: {
    title: "Complaints & suggestions",
    singular: "case",
    group: "Communications",
    description:
      "Track private complaints with reference numbers, persistent replies, and a complete status history.",
    statuses: ["pending", "in-progress", "on-hold", "resolved"],
    fields: [
      ...person,
      f("accountUserId", "Clerk account ID"),
      f("type", "Type", "select", true, ["complaint", "suggestion"]),
      f("title", "Subject", "text", true),
      f("description", "Details", "textarea", true),
    ],
  },
  messages: {
    title: "Member messages",
    singular: "message",
    group: "Communications",
    description:
      "Send a dashboard message to one member or all approved members; optional email delivery is tracked separately.",
    statuses: ["draft", "published", "archived"],
    fields: [
      f("name", "Subject", "text", true),
      f("content", "Message", "textarea", true),
      f("audience", "Recipients", "select", true, ["all-members", "member"]),
      f(
        "member",
        "Member reference (individual)",
        "text",
        false,
        undefined,
        "members",
      ),
      f("sendEmail", "Queue email delivery", "checkbox"),
    ],
  },
  "custom-receipts": {
    title: "Custom receipts",
    singular: "receipt",
    group: "Documents",
    description:
      "Record a custom payment acknowledgement. These are not statutory tax-exemption certificates.",
    statuses: ["draft", "confirmed", "void"],
    fields: [
      ...person,
      ...payment,
      f("purpose", "Purpose", "textarea", true),
      f("notes", "Additional details", "textarea"),
    ],
  },
  "membership-payments": {
    title: "Membership & registration payments",
    singular: "fee payment",
    group: "Finance",
    description:
      "Reconcile membership, paid-event, and internship fees against the original server-calculated amount.",
    statuses: ["pending", "confirmed", "void"],
    fields: [
      f("name", "Payer name", "text", true),
      f("email", "Email", "email", true),
      f("sourceModule", "Registration type", "select", true, [
        "members",
        "registrations",
        "applications",
        "renewals",
      ]),
      f("source", "Registration reference", "text", true),
      ...payment,
    ],
  },
  "recurring-donations": {
    title: "Auto Pay donations",
    singular: "subscription",
    group: "Finance",
    description:
      "Gateway-backed monthly donation mandates. Lifecycle changes are sent to the provider; every successful charge creates a reconciled donation and receipt.",
    statuses: [
      "created",
      "authenticated",
      "active",
      "paused",
      "pending",
      "halted",
      "cancelled",
      "completed",
      "setup-failed",
    ],
    readOnly: true,
    fields: [
      f("name", "Donor"),
      f("email", "Email", "email"),
      f("amount", "Monthly amount (INR)", "money"),
      f("subscriptionId", "Gateway subscription"),
    ],
  },
  documents: {
    title: "Unified receipt & document register",
    singular: "document",
    group: "Documents",
    description:
      "Automatically issued receipts, membership documents, and verifiable acknowledgements. Originals are retained; voided sources revoke their documents.",
    statuses: ["issued", "revoked"],
    readOnly: true,
    fields: [
      f("name", "Recipient"),
      f("email", "Email", "email"),
      f("type", "Document type"),
      f("date", "Issue date", "date"),
      f("amount", "Amount (INR)", "money"),
      f("source", "Source record"),
    ],
  },
  audit: {
    title: "Activity history",
    singular: "audit entry",
    group: "Administration",
    description:
      "Append-only records of administrative and coordinator changes.",
    statuses: ["recorded"],
    readOnly: true,
    fields: [],
  },
} satisfies Record<string, ModuleDefinition>;
export type ModuleKey = keyof typeof modules;
export const moduleEntries = Object.entries(modules) as [
  ModuleKey,
  ModuleDefinition,
][];
export function getModule(key: string): ModuleDefinition | undefined {
  return Object.prototype.hasOwnProperty.call(modules, key)
    ? modules[key as ModuleKey]
    : undefined;
}
export type NgoRecord = {
  id: string;
  module: string;
  reference: string;
  status: string;
  ownerId?: string;
  data: Record<string, string | number | boolean>;
  revision: number;
  createdAt: string;
  updatedAt: string;
};
