import "server-only";
import { Types } from "mongoose";
import { createHash } from "node:crypto";
import { Resend } from "resend";
import { NgoDeliveryModel, NgoRecordModel } from "@/models/NgoRecord";
import {
  getServerEnv,
  getVerifiedSiteOrigin,
  isProductionRuntime,
} from "../env";
import { requireNgoDatabase } from "./access";
import { queueEmail, recordInput } from "./records";
import { renderNgoDocument, documentValidity } from "./documents";
export async function processNgoOutbox(limit = 10) {
  await requireNgoDatabase();
  await processMessageBroadcasts();
  const env = getServerEnv();
  const from = env.RESEND_FROM_EMAIL;
  const pending = await NgoDeliveryModel.countDocuments({
    status: { $in: ["pending", "failed"] },
    attempts: { $lt: 3 },
  });
  if (
    !env.RESEND_API_KEY ||
    !from ||
    (isProductionRuntime() && from.includes("resend.dev"))
  )
    return { processed: 0, pending, blocked: "verified_sender_required" };
  const client = new Resend(env.RESEND_API_KEY);
  await NgoDeliveryModel.updateMany(
    {
      status: "sending",
      updatedAt: { $lt: new Date(Date.now() - 15 * 60000) },
    },
    { $set: { status: "failed", error: "delivery_interrupted" } },
  );
  let processed = 0;
  for (let i = 0; i < Math.min(20, limit); i++) {
    const job = await NgoDeliveryModel.findOneAndUpdate(
      { status: { $in: ["pending", "failed"] }, attempts: { $lt: 3 } },
      { $set: { status: "sending" }, $inc: { attempts: 1 } },
      { sort: { createdAt: 1 }, new: true },
    );
    if (!job) break;
    try {
      let attachments: Array<{ filename: string; content: Buffer }> | undefined;
      let text = job.text;
      if (job.documentId) {
        const doc = await NgoRecordModel.findById(job.documentId);
        if (!doc || !(await documentValidity(doc)))
          throw new Error("document_not_valid");
        attachments = [
          {
            filename: `${doc.reference}.pdf`,
            content: await renderNgoDocument(doc),
          },
        ];
        const origin = getVerifiedSiteOrigin();
        if (origin)
          text += `\n\nPrivate download: ${origin}/api/ngo/documents/${doc._id}?token=${doc.downloadToken}`;
      }
      const result = await client.emails.send(
        { from, to: job.to, subject: job.subject, text, attachments },
        {
          idempotencyKey: `ngo-${createHash("sha256").update(job.key).digest("hex")}`,
        },
      );
      if (result.error) throw new Error("provider_delivery_rejected");
      job.status = "sent";
      job.error = undefined;
      await job.save();
    } catch (e) {
      job.status = "failed";
      job.error =
        e instanceof Error &&
        ["document_not_valid", "provider_delivery_rejected"].includes(e.message)
          ? e.message
          : "provider_unavailable";
      await job.save();
    }
    processed++;
  }
  return {
    processed,
    pending: await NgoDeliveryModel.countDocuments({
      status: { $in: ["pending", "failed"] },
      attempts: { $lt: 3 },
    }),
  };
}
export async function runNgoDailyJobs() {
  await requireNgoDatabase();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (k: string) => parts.find((p) => p.type === k)?.value ?? "";
  const date = `${part("year")}-${part("month")}-${part("day")}`,
    birthday = `${part("month")}-${part("day")}`;
  await NgoRecordModel.updateMany(
    {
      module: "members",
      status: "approved",
      deletedAt: null,
      "data._expires": { $lt: date, $ne: "" },
    },
    {
      $set: { status: "expired", updatedBy: "scheduled-job" },
      $inc: { revision: 1 },
    },
  );
  const members = NgoRecordModel.find({
    module: "members",
    status: "approved",
    deletedAt: null,
    $expr: {
      $eq: [
        { $substrCP: [{ $ifNull: ["$data.dateOfBirth", ""] }, 5, 5] },
        birthday,
      ],
    },
  }).cursor();
  let birthdayCount = 0;
  for await (const member of members) {
    if (member.data._expires && String(member.data._expires) < date) {
      member.status = "expired";
      member.revision++;
      member.updatedBy = "scheduled-job";
      await member.save();
      continue;
    }
    if (String(member.data.dateOfBirth ?? "").slice(5) !== birthday) continue;
    const key = `birthday:${member._id}:${part("year")}`;
    const doc = await NgoRecordModel.findOneAndUpdate(
      { identityKey: key },
      {
        $setOnInsert: {
          ...recordInput(
            "messages",
            {
              name: "Happy birthday!",
              content: `Happy birthday, ${member.data.name}! Thank you for your contribution to the foundation.`,
              audience: "member",
              member: member._id.toString(),
            },
            "published",
            "scheduled-job",
            member.ownerId,
          ),
          identityKey: key,
        },
      },
      { upsert: true, new: true },
    );
    await queueEmail(
      key,
      String(member.data.email),
      "Birthday wishes from Skymeredian Foundation",
      String(doc.data.content),
    );
    birthdayCount++;
  }
  const { reconcilePendingHostedPayments } = await import("./hosted-payments");
  return {
    birthdayCount,
    reconciliation: await reconcilePendingHostedPayments(),
    delivery: await processNgoOutbox(20),
  };
}

export async function processMessageBroadcasts(batchSize = 250) {
  const db = await requireNgoDatabase();
  const session = await db.startSession();
  let queued = 0;
  try {
    await session.withTransaction(async () => {
      const job = await NgoRecordModel.findOne({
        module: "broadcast-jobs",
        status: "pending",
      })
        .sort({ createdAt: 1 })
        .session(session);
      if (!job) return;
      const message = await NgoRecordModel.findOne({
        _id: String(job.data.message),
        module: "messages",
        status: "published",
        deletedAt: null,
      }).session(session);
      if (!message) {
        job.status = "cancelled";
        await job.save({ session });
        return;
      }
      const filter: Record<string, unknown> = {
        module: "members",
        status: "approved",
        deletedAt: null,
        createdAt: { $lte: new Date(String(job.data.cutoff)) },
      };
      if (job.data.member) filter._id = String(job.data.member);
      else if (job.data.cursor)
        filter._id = { $gt: new Types.ObjectId(String(job.data.cursor)) };
      const members = await NgoRecordModel.find(filter)
        .sort({ _id: 1 })
        .limit(batchSize)
        .session(session);
      if (members.length)
        await NgoDeliveryModel.bulkWrite(
          members.map((member) => ({
            updateOne: {
              filter: { key: `message:${message._id}:${member._id}` },
              update: {
                $setOnInsert: {
                  key: `message:${message._id}:${member._id}`,
                  to: String(member.data.email),
                  subject: String(message.data.name),
                  text: String(message.data.content),
                  status: "pending",
                  attempts: 0,
                },
              },
              upsert: true,
            },
          })),
          { session },
        );
      queued = members.length;
      job.data = {
        ...job.data,
        cursor: members.at(-1)?._id.toString() ?? String(job.data.cursor),
        queued: Number(job.data.queued ?? 0) + queued,
      };
      if (members.length < batchSize || job.data.member)
        job.status = "completed";
      job.revision++;
      await job.save({ session });
    });
  } finally {
    await session.endSession();
  }
  return { queued };
}
