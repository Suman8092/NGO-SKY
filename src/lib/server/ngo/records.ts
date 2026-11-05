import "server-only";
import { addCalendarMonths } from "@/lib/ngo/dates";
import { randomBytes } from "node:crypto";
import { Types, type ClientSession } from "mongoose";
import { getModule, type NgoRecord } from "@/lib/ngo/catalog";
import {
  NgoAuditModel,
  NgoDeliveryModel,
  NgoRecordModel,
  type NgoDocument,
} from "@/models/NgoRecord";
import { ApiError } from "../errors";
import { requireNgoDatabase, type NgoActor } from "./access";
import { literalSearch, validateData } from "./validation";
export const financialModules = new Set([
  "offline-donations",
  "membership-payments",
  "project-funds",
  "expenses",
  "custom-receipts",
]);
export const documentModules = new Set([
  "documents",
  "certificates",
  "letters",
  "custom-receipts",
]);
export function serializeRecord(d: NgoDocument): NgoRecord {
  return {
    id: d._id.toString(),
    module: d.module,
    reference: d.reference,
    status: d.status,
    ownerId: d.ownerId,
    data: d.data,
    revision: d.revision,
    createdAt: new Date(d.createdAt).toISOString(),
    updatedAt: new Date(d.updatedAt).toISOString(),
  };
}
export function reference(module: string) {
  return `${module.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${randomBytes(6).toString("hex").toUpperCase()}`;
}
export function recordInput(
  module: string,
  data: NgoDocument["data"],
  status: string,
  actor: string,
  ownerId?: string,
) {
  return {
    module,
    reference: reference(module),
    status,
    data,
    ownerId,
    verifyToken: randomBytes(32).toString("hex"),
    downloadToken: randomBytes(32).toString("hex"),
    revision: 1,
    createdBy: actor,
    updatedBy: actor,
  };
}
export function accessFilter(module: string, actor: NgoActor) {
  if (actor.admin) return {};
  if (!actor.coordinator || !getModule(module)?.coordinator)
    throw new ApiError(
      403,
      "FORBIDDEN",
      "This workspace is restricted to authorized staff.",
    );
  return {
    $or: [{ createdBy: actor.id }, { "data.coordinator": actor.coordinator }],
  };
}
export function listFilter(
  module: string,
  params: URLSearchParams,
  actor: NgoActor,
) {
  const filter: Record<string, unknown> = {
    module,
    deletedAt: null,
    ...accessFilter(module, actor),
  };
  const and: Record<string, unknown>[] = [];
  const q = params.get("q")?.trim().slice(0, 160);
  if (q) {
    const rx = new RegExp(literalSearch(q), "i");
    and.push({
      $or: [
        "reference",
        "data.name",
        "data.email",
        "data.phone",
        "data.transaction",
        "data.title",
        "data.location",
        "data.category",
        "data.item",
      ].map((k) => ({ [k]: rx })),
    });
  }
  const status = params.get("status");
  if (status && getModule(module)?.statuses.includes(status))
    filter.status = status;
  const method = params.get("method");
  if (method) filter["data.method"] = method.slice(0, 40);
  const category = params.get("category");
  if (category) filter["data.category"] = category.slice(0, 120);
  const coordinator = params.get("coordinator");
  if (coordinator && actor.admin) filter["data.coordinator"] = coordinator;
  const user = params.get("user");
  if (user && actor.admin) filter.ownerId = user.slice(0, 100);
  const designation = params.get("designation");
  if (designation) filter["data.designation"] = designation;
  const project = params.get("project");
  if (project) filter["data.project"] = project;
  const date: Record<string, string> = {};
  for (const [param, op] of [
    ["from", "$gte"],
    ["to", "$lte"],
  ]) {
    const value = params.get(param);
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) date[op] = value;
  }
  if (Object.keys(date).length) {
    const created: Record<string, Date> = {};
    if (date.$gte) created.$gte = new Date(date.$gte);
    if (date.$lte) created.$lte = new Date(`${date.$lte}T23:59:59.999Z`);
    and.push({
      $or: [
        { "data.date": date },
        { "data.date": { $exists: false }, createdAt: created },
      ],
    });
  }
  if (and.length) filter.$and = and;
  return filter;
}
export async function findLinked(
  module: string,
  id: unknown,
  session?: ClientSession | null,
) {
  if (typeof id !== "string" || !id) return null;
  const query = Types.ObjectId.isValid(id) ? { _id: id } : { reference: id };
  return NgoRecordModel.findOne({ module, ...query, deletedAt: null }).session(
    session ?? null,
  );
}
export async function queueEmail(
  key: string,
  to: string,
  subject: string,
  text: string,
  documentId?: string,
  session?: ClientSession,
) {
  await NgoDeliveryModel.updateOne(
    { key },
    {
      $setOnInsert: {
        key,
        to,
        subject,
        text,
        documentId,
        status: "pending",
        attempts: 0,
      },
    },
    { upsert: true, session },
  );
}
export async function createDocument(
  source: NgoDocument,
  type: string,
  session: ClientSession,
) {
  const key = `document:${source._id}:${type}`;
  if (
    await NgoRecordModel.exists({
      module: "documents",
      "data.source": source._id.toString(),
      "data.type": type,
      status: "issued",
    }).session(session)
  )
    return;
  const existing = await NgoRecordModel.findOne({ identityKey: key }).session(
    session,
  );
  if (existing?.status === "issued") return;
  const organization = await NgoRecordModel.findOne({
    module: "organization",
    status: "active",
    deletedAt: null,
  }).session(session);
  const officialIdentityReady = !!(
    organization?.data.name &&
    organization?.data.address &&
    organization?.data.signatory
  );
  const provisional =
    source.data._provisional === true ||
    (["membership-certificate", "id-card", "appointment"].includes(type) &&
      !officialIdentityReady);
  const tax =
    type === "donation-receipt"
      ? await (
          await import("./tax-receipts")
        ).taxReceiptSnapshot(
          String(source.data.date),
          Math.round(Number(source.data.amount) * 100),
          String(source.data.method),
          session,
        )
      : {};
  const data = {
    ...tax,
    _issuerName: String(organization?.data.name ?? ""),
    _issuerAddress: String(organization?.data.address ?? ""),
    _issuerEmail: String(organization?.data.email ?? ""),
    _issuerPhone: String(organization?.data.phone ?? ""),
    _provisional: provisional,
    name: String(source.data.name ?? ""),
    email: String(source.data.email ?? ""),
    title: type.replaceAll("-", " "),
    content: String(
      source.data.purpose ??
        source.data.notes ??
        "Issued from the foundation membership and operations register.",
    ),
    date: String(source.data.date ?? new Date().toISOString().slice(0, 10)),
    type,
    template: "classic",
    signatory: String(organization?.data.signatory ?? ""),
    source: source._id.toString(),
    sourceModule: source.module,
    photo: String(source.data.photo ?? ""),
    expiry: String(source.data._expires ?? ""),
    item: String(source.data.item ?? ""),
    quantity: Number(source.data.quantity ?? 0),
    unit: String(source.data.unit ?? ""),
    estimatedValue: Number(source.data.estimatedValue ?? 0),
    amount: Number(source.data.amount ?? 0),
    method: String(source.data.method ?? ""),
    transaction: String(source.data.transaction ?? ""),
  };
  if (existing?.status === "draft" && provisional) return;
  const [doc] = await NgoRecordModel.create(
    [
      {
        ...recordInput(
          "documents",
          data,
          provisional ? "draft" : "issued",
          source.updatedBy,
          source.ownerId,
        ),
        identityKey: existing ? `${key}:reissue:${source.revision}` : key,
      },
    ],
    { session },
  );
  if (data.email && !provisional)
    await queueEmail(
      `issue:${doc._id}`,
      data.email,
      `Skymeredian Foundation: ${type.replaceAll("-", " ")}`,
      `Your document ${doc.reference} is ready. Sign in to your membership dashboard to download it.`,
      doc._id.toString(),
      session,
    );
}
export async function applyRecordEffects(
  doc: NgoDocument,
  previousStatus: string | undefined,
  session: ClientSession,
) {
  if (doc.module === "membership-payments" && doc.status === "confirmed") {
    const source = await findLinked(
      String(doc.data.sourceModule),
      doc.data.source,
      session,
    );
    if (
      !source ||
      !["members", "registrations", "applications", "renewals"].includes(
        source.module,
      )
    )
      throw new ApiError(
        422,
        "INVALID_REGISTRATION",
        "Choose a valid membership, event, or internship registration.",
      );
    if (
      source.data._paymentStatus === "paid" &&
      source.data._paymentReference !== doc.reference
    )
      throw new ApiError(
        409,
        "ALREADY_PAID",
        "This registration already has a confirmed fee payment.",
      );
    if (
      Math.round(Number(doc.data.amount) * 100) !==
      Number(source.data._feeMinor)
    )
      throw new ApiError(
        422,
        "AMOUNT_MISMATCH",
        "Payment amount must match the original registration fee.",
      );
    doc.data = {
      ...doc.data,
      source: source._id.toString(),
      _provisional: source.data._provisional === true,
    };
    source.data = {
      ...source.data,
      _paymentStatus: "paid",
      _paymentReference: doc.reference,
    };
    source.revision++;
    source.updatedBy = doc.updatedBy;
    await source.save({ session });
    doc.ownerId = source.ownerId;
    await createDocument(
      doc,
      ["members", "renewals"].includes(source.module)
        ? "membership-receipt"
        : source.module === "registrations"
          ? "event-receipt"
          : "internship-receipt",
      session,
    );
  }
  if (
    doc.module === "renewals" &&
    doc.status === "approved" &&
    previousStatus !== "approved"
  ) {
    if (Number(doc.data._feeMinor) > 0 && doc.data._paymentStatus !== "paid")
      throw new ApiError(
        409,
        "RENEWAL_FEE_UNPAID",
        "Confirm the renewal fee before approving this renewal.",
      );
    const member = await findLinked("members", doc.data.member, session);
    if (!member || !["approved", "expired"].includes(member.status))
      throw new ApiError(
        409,
        "MEMBER_NOT_ELIGIBLE",
        "A blocked or rejected membership cannot be renewed.",
      );
    const today = new Date().toISOString().slice(0, 10),
      start =
        String(member.data._expires ?? "") > today
          ? String(member.data._expires)
          : today;
    const expiry = addCalendarMonths(start, Number(doc.data._termMonths ?? 12));
    doc.data = {
      ...doc.data,
      _previousExpiry: String(member.data._expires ?? ""),
      _previousStatus: member.status,
    };
    member.data = {
      ...member.data,
      designation: String(doc.data.designation),
      _expires: expiry,
      _lastRenewalId: doc._id.toString(),
      _provisional: doc.data._provisional === true,
      _termMonths: Number(doc.data._termMonths ?? 12),
      _paymentStatus: doc.data._paymentStatus ?? "not-required",
    };
    member.status = "approved";
    member.revision++;
    member.updatedBy = doc.updatedBy;
    await member.save({ session });
    doc.ownerId = member.ownerId;
    doc.data = { ...doc.data, _newExpiry: member.data._expires };
    doc.identityKey = undefined;
    await NgoRecordModel.updateMany(
      {
        module: "documents",
        "data.source": member._id.toString(),
        status: "issued",
      },
      { $set: { status: "revoked" }, $inc: { revision: 1 } },
      { session },
    );
    for (const type of ["membership-certificate", "id-card", "appointment"])
      await createDocument(member, type, session);
  }
  if (
    doc.module === "renewals" &&
    ["rejected", "cancelled"].includes(doc.status)
  )
    doc.identityKey = undefined;
  if (doc.module === "members" && doc.status === "approved") {
    if (!doc.data._expires) {
      const designation = await findLinked(
        "designations",
        doc.data.designation,
        session,
      );
      const expiry = addCalendarMonths(
        new Date().toISOString().slice(0, 10),
        Number(doc.data._termMonths ?? designation?.data.termMonths ?? 12),
      );
      doc.data = { ...doc.data, _expires: expiry };
    }
    if (Number(doc.data._feeMinor) > 0 && doc.data._paymentStatus !== "paid")
      throw new ApiError(
        409,
        "MEMBERSHIP_FEE_UNPAID",
        "Confirm the membership fee before approving this application.",
      );
    for (const type of ["membership-certificate", "id-card", "appointment"])
      await createDocument(doc, type, session);
  }
  if (doc.module === "offline-donations" && doc.status === "confirmed")
    await createDocument(doc, "donation-receipt", session);
  if (
    doc.module === "in-kind" &&
    ["received", "distributed"].includes(doc.status)
  )
    await createDocument(doc, "item-receipt", session);
  if (doc.module === "custom-receipts" && doc.status === "confirmed")
    await createDocument(doc, "custom-receipt", session);
  if (
    ["certificates", "letters"].includes(doc.module) &&
    doc.status === "issued"
  ) {
    const organization = await NgoRecordModel.findOne({
      module: "organization",
      status: "active",
      deletedAt: null,
    }).session(session);
    if (
      !organization?.data.name ||
      !organization.data.address ||
      !organization.data.signatory
    )
      throw new ApiError(
        409,
        "OFFICIAL_IDENTITY_PENDING",
        "Configure the real organization address and authorized signatory before issuing official documents. Save a draft for preview instead.",
      );
    if (!doc.data.signatory)
      doc.data = {
        ...doc.data,
        signatory: String(organization.data.signatory),
      };
    if (doc.data.member) {
      const member = await findLinked("members", doc.data.member, session);
      if (!member || member.status !== "approved")
        throw new ApiError(
          409,
          "MEMBER_NOT_APPROVED",
          "This document requires an approved, unblocked membership.",
        );
      doc.ownerId = member.ownerId;
    }
    if (doc.data.type === "internship-certificate") {
      const application = await findLinked(
        "applications",
        doc.data.application,
        session,
      );
      if (!application || application.status !== "completed")
        throw new ApiError(
          409,
          "INTERNSHIP_NOT_COMPLETED",
          "Select a completed internship application before issuing this certificate.",
        );
      doc.ownerId = application.ownerId;
    }
    if (doc.data.sendEmail && previousStatus !== "issued")
      await queueEmail(
        `issue:${doc._id}`,
        String(doc.data.email),
        `Skymeredian Foundation: ${doc.data.title}`,
        `Your document ${doc.reference} has been issued.`,
        doc._id.toString(),
        session,
      );
  }
  if (
    doc.module === "complaints" &&
    previousStatus &&
    previousStatus !== doc.status &&
    doc.data.email
  )
    await queueEmail(
      `case-status:${doc._id}:${doc.revision}`,
      String(doc.data.email),
      `Update to case ${doc.reference}`,
      `Your case status is now ${doc.status}. Sign in to your member dashboard to view the conversation.`,
      undefined,
      session,
    );
  if (
    doc.module === "messages" &&
    doc.status === "published" &&
    previousStatus !== "published" &&
    doc.data.sendEmail
  ) {
    await NgoRecordModel.updateOne(
      { identityKey: `broadcast:${doc._id}` },
      {
        $setOnInsert: {
          ...recordInput(
            "broadcast-jobs",
            {
              message: doc._id.toString(),
              cursor: "",
              cutoff: new Date().toISOString(),
              member:
                doc.data.audience === "member" ? String(doc.data.member) : "",
            },
            "pending",
            doc.updatedBy,
          ),
          identityKey: `broadcast:${doc._id}`,
        },
      },
      { upsert: true, session },
    );
  }
  if (
    ["void", "revoked", "blocked", "expired", "rejected"].includes(doc.status)
  ) {
    await NgoRecordModel.updateMany(
      {
        module: "documents",
        "data.source": doc._id.toString(),
        status: "issued",
      },
      {
        $set: { status: "revoked", updatedBy: doc.updatedBy },
        $inc: { revision: 1 },
      },
      { session },
    );
  }
}
export async function saveRecord(
  module: string,
  input: { data: Record<string, unknown>; status: string; revision?: number },
  actor: NgoActor,
  id?: string,
) {
  const definition = getModule(module);
  if (
    !definition ||
    definition.readOnly ||
    !definition.statuses.includes(input.status)
  )
    throw new ApiError(
      422,
      "INVALID_STATUS",
      "Choose a valid module and status.",
    );
  accessFilter(module, actor);
  const data = validateData(module, input.data);
  if (!actor.admin && input.status !== definition.statuses[0])
    throw new ApiError(
      403,
      "REVIEW_REQUIRED",
      "Coordinators may submit records; only administrators can approve them.",
    );
  const db = await requireNgoDatabase();
  const session = await db.startSession();
  let output: NgoRecord | undefined;
  try {
    await session.withTransaction(async () => {
      const doc = id
        ? await NgoRecordModel.findOne({
            _id: id,
            module,
            deletedAt: null,
            ...accessFilter(module, actor),
          }).session(session)
        : new NgoRecordModel(recordInput(module, data, input.status, actor.id));
      if (!doc) throw new ApiError(404, "NOT_FOUND", "Record not found.");
      const old = id ? doc.status : undefined;
      if (id && module === "renewals" && old === "approved")
        throw new ApiError(
          409,
          "RENEWAL_LOCKED",
          "An approved renewal is an immutable record. Submit a new renewal for a future term.",
        );
      if (
        id &&
        module === "members" &&
        String(doc.data.designation) !== String(data.designation) &&
        doc.data._paymentStatus === "paid"
      )
        throw new ApiError(
          409,
          "DESIGNATION_CHANGE_REQUIRES_RENEWAL",
          "Use a renewal to change the designation of a paid membership.",
        );
      if (id && doc.revision !== input.revision)
        throw new ApiError(
          409,
          "STALE_RECORD",
          "This record changed. Reload it before saving.",
        );
      if (
        id &&
        financialModules.has(module) &&
        ["confirmed", "approved", "void"].includes(doc.status)
      )
        throw new ApiError(
          409,
          "FINANCIAL_RECORD_LOCKED",
          "Confirmed financial records are immutable. Contact the finance administrator for a documented reversal.",
        );
      if (
        id &&
        ["certificates", "letters"].includes(module) &&
        doc.status === "issued" &&
        input.status !== "revoked"
      )
        throw new ApiError(
          409,
          "ISSUED_DOCUMENT_LOCKED",
          "Issued documents are immutable. Revoke the original and issue a replacement.",
        );
      if (!actor.admin && data.validUntil)
        throw new ApiError(
          403,
          "FORBIDDEN",
          "Only an administrator can correct validity dates.",
        );
      if (!actor.admin && data.accountUserId)
        throw new ApiError(
          403,
          "ACCOUNT_ASSIGNMENT_RESTRICTED",
          "Only an administrator can link another person's login account.",
        );
      if (id && !actor.admin && doc.status !== definition.statuses[0])
        throw new ApiError(
          403,
          "RECORD_LOCKED",
          "A reviewed record can only be changed by an administrator.",
        );
      for (const field of definition.fields.filter(
        (f) => f.reference && data[f.key],
      )) {
        let linked = await findLinked(
          field.reference!,
          data[field.key],
          session,
        );
        if (
          !linked &&
          id &&
          String(doc.data[field.key]) === String(data[field.key]) &&
          Types.ObjectId.isValid(String(data[field.key]))
        )
          linked = await NgoRecordModel.findOne({
            _id: String(data[field.key]),
            module: field.reference,
          }).session(session);
        if (!linked)
          throw new ApiError(
            422,
            "INVALID_REFERENCE",
            `${field.label}: record not found.`,
          );
        if (
          !actor.admin &&
          field.reference === "beneficiaries" &&
          linked.createdBy !== actor.id &&
          linked.data.coordinator !== actor.coordinator
        )
          throw new ApiError(
            403,
            "FORBIDDEN",
            "This beneficiary is assigned to another coordinator.",
          );
        data[field.key] = linked._id.toString();
      }
      if (
        !actor.admin &&
        actor.coordinator &&
        definition.fields.some((f) => f.key === "coordinator")
      )
        data.coordinator = actor.coordinator;
      const computed = Object.fromEntries(
        Object.entries(doc.data ?? {}).filter(([k]) => k.startsWith("_")),
      );
      if (
        !id &&
        ["members", "registrations", "applications", "renewals"].includes(
          module,
        )
      ) {
        const sourceModule = ["members", "renewals"].includes(module)
          ? "designations"
          : module === "registrations"
            ? "events"
            : "internships";
        const sourceField = ["members", "renewals"].includes(module)
          ? "designation"
          : module === "registrations"
            ? "event"
            : "internship";
        const source = await findLinked(
          sourceModule,
          data[sourceField],
          session,
        );
        if (!source)
          throw new ApiError(
            422,
            "INVALID_REFERENCE",
            "The selected program or designation is unavailable.",
          );
        computed._termMonths = Number(source.data.termMonths ?? 12);
        computed._provisional = source.data.provisional === true;
        computed._feeMinor = Math.round(Number(source.data.fee ?? 0) * 100);
        computed._paymentStatus = computed._feeMinor
          ? "unpaid"
          : "not-required";
      }
      if (module === "members" && data.validUntil) {
        if (String(data.notes ?? "").trim().length < 10)
          throw new ApiError(
            422,
            "CORRECTION_REASON_REQUIRED",
            "Add review notes explaining the validity correction.",
          );
        if (id && String(doc.data._expires ?? "") !== String(data.validUntil))
          await NgoRecordModel.updateMany(
            {
              module: "documents",
              "data.source": doc._id.toString(),
              status: "issued",
            },
            {
              $set: { status: "revoked", updatedBy: actor.id },
              $inc: { revision: 1 },
            },
            { session },
          );
        computed._expires = String(data.validUntil);
        delete data.validUntil;
      }
      doc.data = { ...data, ...computed };
      doc.status = input.status;
      doc.updatedBy = actor.id;
      if (
        data.accountUserId &&
        [
          "members",
          "coordinators",
          "registrations",
          "applications",
          "complaints",
        ].includes(module)
      )
        doc.ownerId = String(data.accountUserId);
      if (module === "renewals" && !id) {
        const member = await findLinked("members", data.member, session);
        if (!member)
          throw new ApiError(
            422,
            "MEMBER_REQUIRED",
            "Choose the member being renewed.",
          );
        doc.ownerId = member.ownerId;
        doc.identityKey = `renewal:${member._id}:pending`;
      }
      if (module === "tax-approvals" && doc.status === "active") {
        const fileId = String(data.proof).split("/").pop();
        const proof = await db.connection
          .db!.collection("ngoUploads.files")
          .findOne({ _id: new Types.ObjectId(fileId) }, { session });
        if (!proof || proof.metadata?.publicImage)
          throw new ApiError(
            422,
            "APPROVAL_EVIDENCE_REQUIRED",
            "Upload the genuine private approval document before activation.",
          );
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(String(data.pan)))
          throw new ApiError(
            422,
            "INVALID_PAN",
            "Enter the organization's genuine PAN in uppercase.",
          );
        const org = await NgoRecordModel.findOne({
          module: "organization",
          status: "active",
          deletedAt: null,
        }).session(session);
        if (!org?.data.address || !org.data.signatory)
          throw new ApiError(
            409,
            "OFFICIAL_IDENTITY_PENDING",
            "Configure the real organization profile before activating tax approval.",
          );
        await NgoRecordModel.updateMany(
          { module: "tax-approvals", status: "active", _id: { $ne: doc._id } },
          {
            $set: { status: "expired" },
            $unset: { identityKey: 1 },
            $inc: { revision: 1 },
          },
          { session },
        );
        doc.identityKey = "active-tax-approval";
      } else if (module === "tax-approvals") doc.identityKey = undefined;
      if (module === "gateways" && doc.status === "active") {
        const { assertHostedConfigured } = await import("./gateway-config");
        assertHostedConfigured(
          String(data.provider) as "razorpay" | "phonepe" | "payu",
          String(data.environment) as "production" | "sandbox",
        );
        await NgoRecordModel.updateMany(
          { module: "gateways", status: "active", _id: { $ne: doc._id } },
          {
            $set: { status: "inactive" },
            $unset: { identityKey: 1 },
            $inc: { revision: 1 },
          },
          { session },
        );
        doc.identityKey = "active-payment-gateway";
      } else if (module === "gateways") doc.identityKey = undefined;
      if (module === "organization") doc.identityKey = "organization-profile";
      if (module === "members" && doc.ownerId)
        doc.identityKey = `member:${doc.ownerId}`;
      if (module === "coordinators")
        doc.identityKey = `coordinator:${data.accountUserId}`;
      if (id) doc.revision++;
      await doc.save({ session });
      await applyRecordEffects(doc, old, session);
      await doc.save({ session });
      await NgoAuditModel.create(
        [
          {
            actor: actor.id,
            action: id ? "update" : "create",
            module,
            recordId: doc._id.toString(),
            reference: doc.reference,
            fields: [
              ...Object.keys(data),
              `status:${old ?? "new"}->${doc.status}`,
            ],
          },
        ],
        { session },
      );
      output = serializeRecord(doc);
    });
  } finally {
    await session.endSession();
  }
  if (!output)
    throw new ApiError(500, "WRITE_FAILED", "The record could not be saved.");
  return output;
}
export async function archiveRecord(
  module: string,
  id: string,
  revision: number,
  actor: NgoActor,
) {
  if (
    !actor.admin ||
    financialModules.has(module) ||
    ["members", "renewals", "coordinators", "certificates", "letters"].includes(
      module,
    )
  )
    throw new ApiError(
      403,
      "ARCHIVE_NOT_ALLOWED",
      "Use the record status to block, revoke, or retain this protected record.",
    );
  await requireNgoDatabase();
  const doc = await NgoRecordModel.findOneAndUpdate(
    { _id: id, module, revision, deletedAt: null },
    {
      $set: { deletedAt: new Date(), updatedBy: actor.id },
      $inc: { revision: 1 },
    },
    { new: true },
  );
  if (!doc)
    throw new ApiError(
      409,
      "STALE_RECORD",
      "The record was changed or is no longer available.",
    );
  await NgoAuditModel.create({
    actor: actor.id,
    action: "archive",
    module,
    recordId: id,
    reference: doc.reference,
    fields: [],
  });
}
