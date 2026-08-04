import { createHash } from "node:crypto";

import {
  ContactSubmissionModel,
  DonationModel,
  type DonationDocument,
  type DonationStatus,
  type PaymentProvider,
  NewsletterSubscriberModel,
  VolunteerApplicationModel,
} from "../../models";
import { connectMongo } from "./db";
import { demoId, getDemoRecord, putDemoRecord, updateDemoRecord } from "./memory-store";
import type { ContactInput, DonationInput, NewsletterInput, VolunteerInput } from "./validation";

export type PersistenceMode = "mongodb" | "memory";

export type RequestMetadata = {
  requestId: string;
  ip?: string;
  userAgent?: string;
};

export type StoredResult<T> = {
  record: T;
  persistence: PersistenceMode;
  created: boolean;
};

export type DonationRecord = {
  id: string;
  amountMinor: number;
  currency: DonationDocument["currency"];
  frequency: DonationDocument["frequency"];
  provider: PaymentProvider;
  campaignId?: string;
  donor: { name: string; email: string; phone?: string; country?: string };
  anonymous: boolean;
  message?: string;
  status: DonationStatus;
  externalOrderId?: string;
  externalSessionId?: string;
  externalPaymentId?: string;
  createdAt: string;
  updatedAt: string;
};

type DemoDonation = DonationRecord & Record<string, unknown>;

function digest(value?: string): string | undefined {
  return value ? createHash("sha256").update(value).digest("hex") : undefined;
}

function selectProvider(input: DonationInput): PaymentProvider {
  if (input.provider !== "auto") return input.provider;
  if (input.frequency !== "one_time") return "stripe";
  return input.currency === "INR" ? "razorpay" : "stripe";
}

function donationRecord(document: DonationDocument): DonationRecord {
  return {
    id: document._id.toString(),
    amountMinor: document.amountMinor,
    currency: document.currency,
    frequency: document.frequency,
    provider: document.provider,
    campaignId: document.campaignId,
    donor: {
      name: document.donor.name,
      email: document.donor.email,
      phone: document.donor.phone,
      country: document.donor.country,
    },
    anonymous: document.anonymous,
    message: document.message,
    status: document.status,
    externalOrderId: document.externalOrderId,
    externalSessionId: document.externalSessionId,
    externalPaymentId: document.externalPaymentId,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

function isDuplicateKey(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === 11000);
}

export async function storeContact(
  input: ContactInput,
  metadata: RequestMetadata,
): Promise<StoredResult<{ id: string; status: "new"; submittedAt: string }>> {
  const connection = await connectMongo();
  if (!connection) {
    const record = putDemoRecord(
      "contacts",
      { email: input.email, subject: input.subject, message: input.message },
      { ...input, website: undefined, status: "new", requestId: metadata.requestId },
    );
    return {
      record: { id: record.id, status: "new", submittedAt: record.createdAt },
      persistence: "memory",
      created: true,
    };
  }

  const document = await ContactSubmissionModel.create({
    ...input,
    website: undefined,
    status: "new",
    requestId: metadata.requestId,
    ipHash: digest(metadata.ip),
    userAgent: metadata.userAgent?.slice(0, 300),
  });
  return {
    record: { id: document._id.toString(), status: "new", submittedAt: document.createdAt.toISOString() },
    persistence: "mongodb",
    created: true,
  };
}

export async function storeNewsletterSubscription(
  input: NewsletterInput,
  metadata: RequestMetadata,
): Promise<StoredResult<{ id: string; status: "active"; subscribedAt: string }>> {
  const connection = await connectMongo();
  if (!connection) {
    const id = demoId("newsletter", input.email);
    const existed = Boolean(getDemoRecord("newsletter", id));
    const record = putDemoRecord("newsletter", input.email, {
      ...input,
      website: undefined,
      status: "active",
      requestId: metadata.requestId,
    });
    return {
      record: { id: record.id, status: "active", subscribedAt: record.createdAt },
      persistence: "memory",
      created: !existed,
    };
  }

  const existing = await NewsletterSubscriberModel.findOne({ email: input.email })
    .select("_id status")
    .lean();
  const activated = !existing || existing.status !== "active";
  const document = await NewsletterSubscriberModel.findOneAndUpdate(
    { email: input.email },
    {
      $set: {
        name: input.name,
        source: input.source,
        consent: true,
        status: "active",
        requestId: metadata.requestId,
        ipHash: digest(metadata.ip),
        ...(activated ? { subscribedAt: new Date() } : {}),
      },
      $unset: { unsubscribedAt: 1 },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).orFail();

  return {
    record: {
      id: document._id.toString(),
      status: "active",
      subscribedAt: document.subscribedAt.toISOString(),
    },
    persistence: "mongodb",
    created: activated,
  };
}

export async function storeVolunteerApplication(
  input: VolunteerInput,
  metadata: RequestMetadata,
): Promise<StoredResult<{ id: string; status: "submitted"; submittedAt: string }>> {
  const connection = await connectMongo();
  if (!connection) {
    const record = putDemoRecord(
      "volunteers",
      { email: input.email, interest: input.areaOfInterest, motivation: input.motivation },
      { ...input, website: undefined, status: "submitted", requestId: metadata.requestId },
    );
    return {
      record: { id: record.id, status: "submitted", submittedAt: record.createdAt },
      persistence: "memory",
      created: true,
    };
  }

  const document = await VolunteerApplicationModel.create({
    ...input,
    website: undefined,
    status: "submitted",
    requestId: metadata.requestId,
    ipHash: digest(metadata.ip),
  });
  return {
    record: {
      id: document._id.toString(),
      status: "submitted",
      submittedAt: document.createdAt.toISOString(),
    },
    persistence: "mongodb",
    created: true,
  };
}

export async function storeDonation(
  input: DonationInput,
  metadata: RequestMetadata,
): Promise<StoredResult<DonationRecord>> {
  const provider = selectProvider(input);
  const amountMinor = Math.round(input.amount * 100);
  const taxId = input.donor.taxId?.replace(/\s+/g, "").toUpperCase();
  const connection = await connectMongo();

  if (!connection) {
    const identity =
      input.idempotencyKey ??
      {
        email: input.donor.email,
        amountMinor,
        currency: input.currency,
        frequency: input.frequency,
        campaignId: input.campaignId,
      };
    const id = demoId("donations", identity);
    const existed = Boolean(getDemoRecord("donations", id));
    const record = putDemoRecord("donations", identity, {
      amountMinor,
      currency: input.currency,
      frequency: input.frequency,
      provider,
      campaignId: input.campaignId,
      donor: {
        name: input.donor.name,
        email: input.donor.email,
        phone: input.donor.phone,
        country: input.donor.country,
      },
      anonymous: input.anonymous,
      message: input.message,
      status: "pending",
      requestId: metadata.requestId,
    }) as DemoDonation;
    return { record, persistence: "memory", created: !existed };
  }

  if (input.idempotencyKey) {
    const existing = await DonationModel.findOne({ idempotencyKey: input.idempotencyKey });
    if (existing) return { record: donationRecord(existing), persistence: "mongodb", created: false };
  }

  try {
    const document = await DonationModel.create({
      amountMinor,
      currency: input.currency,
      frequency: input.frequency,
      provider,
      campaignId: input.campaignId,
      donor: {
        name: input.donor.name,
        email: input.donor.email,
        phone: input.donor.phone,
        country: input.donor.country,
        taxIdLast4: taxId?.slice(-4),
      },
      anonymous: input.anonymous,
      message: input.message,
      consent: true,
      status: "pending",
      idempotencyKey: input.idempotencyKey,
      requestId: metadata.requestId,
      ipHash: digest(metadata.ip),
    });
    return { record: donationRecord(document), persistence: "mongodb", created: true };
  } catch (error) {
    if (input.idempotencyKey && isDuplicateKey(error)) {
      const existing = await DonationModel.findOne({ idempotencyKey: input.idempotencyKey }).orFail();
      return { record: donationRecord(existing), persistence: "mongodb", created: false };
    }
    throw error;
  }
}

export async function findDonation(id: string): Promise<StoredResult<DonationRecord> | null> {
  const connection = await connectMongo();
  if (!connection) {
    const record = getDemoRecord<DemoDonation>("donations", id);
    return record ? { record, persistence: "memory", created: false } : null;
  }
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const document = await DonationModel.findById(id);
  return document ? { record: donationRecord(document), persistence: "mongodb", created: false } : null;
}

export async function markDonationPaymentCreated(
  donationId: string,
  reference: { externalOrderId?: string; externalSessionId?: string },
): Promise<DonationRecord | null> {
  const connection = await connectMongo();
  if (!connection) {
    const current = getDemoRecord<DemoDonation>("donations", donationId);
    if (!current || current.status === "paid" || current.status === "refunded") return current;
    return updateDemoRecord<DemoDonation>("donations", donationId, {
      ...reference,
      status: "processing",
    });
  }

  const document = await DonationModel.findOneAndUpdate(
    { _id: donationId, status: { $in: ["pending", "failed", "processing"] } },
    { $set: { ...reference, status: "processing" } },
    { new: true },
  );
  return document ? donationRecord(document) : null;
}

export async function applyDonationPaymentStatus(input: {
  donationId?: string;
  externalOrderId?: string;
  externalSessionId?: string;
  externalPaymentId?: string;
  status: Extract<DonationStatus, "processing" | "paid" | "failed" | "refunded">;
  failureCode?: string;
}): Promise<DonationRecord | null> {
  const connection = await connectMongo();
  const donationId = input.donationId && /^[a-f0-9]{24}$/i.test(input.donationId) ? input.donationId : undefined;
  const reference = donationId ?? input.externalOrderId ?? input.externalSessionId ?? input.externalPaymentId;
  if (!reference) return null;

  if (!connection) {
    if (!input.donationId) return null;
    const current = getDemoRecord<DemoDonation>("donations", input.donationId);
    const wouldDowngrade =
      current &&
      ((current.status === "paid" && ["processing", "failed"].includes(input.status)) ||
        current.status === "refunded");
    if (!current || wouldDowngrade) return current;
    return updateDemoRecord<DemoDonation>("donations", input.donationId, {
      status: input.status,
      externalPaymentId: input.externalPaymentId,
      ...(input.externalOrderId ? { externalOrderId: input.externalOrderId } : {}),
      ...(input.externalSessionId ? { externalSessionId: input.externalSessionId } : {}),
    });
  }

  const query = donationId
    ? { _id: donationId }
    : input.externalOrderId
      ? { externalOrderId: input.externalOrderId }
      : input.externalSessionId
        ? { externalSessionId: input.externalSessionId }
        : { externalPaymentId: input.externalPaymentId };
  const statusGuard =
    input.status === "processing"
      ? { status: { $in: ["pending", "processing"] } }
      : input.status === "failed"
        ? { status: { $in: ["pending", "processing", "failed"] } }
        : input.status === "paid"
          ? { status: { $in: ["pending", "processing", "failed"] } }
          : { status: "paid" };
  const document = await DonationModel.findOneAndUpdate(
    { ...query, ...statusGuard },
    {
      $set: {
        status: input.status,
        ...(input.externalPaymentId ? { externalPaymentId: input.externalPaymentId } : {}),
        ...(input.externalOrderId ? { externalOrderId: input.externalOrderId } : {}),
        ...(input.externalSessionId ? { externalSessionId: input.externalSessionId } : {}),
        ...(input.failureCode ? { failureCode: input.failureCode.slice(0, 100) } : {}),
        ...(input.status === "paid" ? { paidAt: new Date() } : {}),
      },
    },
    { new: true },
  );
  return document ? donationRecord(document) : null;
}
