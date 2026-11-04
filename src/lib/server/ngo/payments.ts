import "server-only";
import { createHash } from "node:crypto";
import { NgoAuditModel, NgoRecordModel } from "@/models/NgoRecord";
import { DonationModel } from "@/models/Donation";
import { getServerEnv, hasRazorpayConfig, isDonationsEnabled } from "../env";
import { ApiError } from "../errors";
import { requireNgoDatabase, type NgoActor } from "./access";
import { applyRecordEffects, recordInput, queueEmail } from "./records";
export function assertGatewayReady() {
  if (!isDonationsEnabled() || !hasRazorpayConfig())
    throw new ApiError(
      503,
      "PAYMENTS_UNAVAILABLE",
      "Online payments require enabled live Razorpay credentials and signed webhooks. Contact the foundation for verified payment instructions.",
    );
}
export async function gatewayRequest(
  path: string,
  body?: Record<string, unknown>,
) {
  const env = getServerEnv();
  if (!hasRazorpayConfig() || !env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET)
    throw new ApiError(
      503,
      "GATEWAY_UNAVAILABLE",
      "The payment gateway is unavailable.",
    );
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(12000),
  });
  const data = await response.json();
  if (!response.ok)
    throw new ApiError(
      502,
      "GATEWAY_REQUEST_FAILED",
      "The gateway could not process this request. No payment has been confirmed.",
    );
  return data as Record<string, unknown>;
}
export async function registrationCheckout(sourceId: string, actor: NgoActor) {
  assertGatewayReady();
  await requireNgoDatabase();
  const source = await NgoRecordModel.findOne({
    _id: sourceId,
    ownerId: actor.id,
    module: { $in: ["members", "registrations", "applications", "renewals"] },
    deletedAt: null,
  });
  if (!source) throw new ApiError(404, "NOT_FOUND", "Registration not found.");
  if (source.data._provisional === true)
    throw new ApiError(
      409,
      "PROVISIONAL_CATEGORY",
      "Provisional categories are for free testing only and cannot collect online payments.",
    );
  if (["blocked", "rejected", "cancelled", "expired"].includes(source.status))
    throw new ApiError(
      409,
      "REGISTRATION_INACTIVE",
      "This registration cannot accept payments.",
    );
  const amount = Number(source.data._feeMinor);
  if (
    !Number.isSafeInteger(amount) ||
    amount < 100 ||
    source.data._paymentStatus === "paid"
  )
    throw new ApiError(
      409,
      "FEE_NOT_DUE",
      "No unpaid registration fee is due.",
    );
  const key = `checkout:${source._id}`;
  let payment = await NgoRecordModel.findOne({ identityKey: key });
  if (payment?.data.orderId)
    return {
      orderId: payment.data.orderId,
      keyId: getServerEnv().RAZORPAY_KEY_ID,
      amountMinor: amount,
    };
  if (payment)
    throw new ApiError(
      409,
      "CHECKOUT_PENDING",
      "A checkout is being prepared. Please retry shortly.",
    );
  payment = await NgoRecordModel.create({
    ...recordInput(
      "gateway-payments",
      {
        source: source._id.toString(),
        sourceModule: source.module,
        amountMinor: amount,
        name: String(source.data.name),
        email: String(source.data.email),
      },
      "pending",
      actor.id,
      actor.id,
    ),
    identityKey: key,
  });
  try {
    const order = await gatewayRequest("orders", {
      amount,
      currency: "INR",
      receipt: payment.reference.slice(0, 40),
      notes: { ngoPaymentId: payment._id.toString() },
    });
    if (
      typeof order.id !== "string" ||
      Number(order.amount) !== amount ||
      order.currency !== "INR"
    )
      throw new ApiError(
        502,
        "INVALID_GATEWAY_RESPONSE",
        "The gateway returned an invalid order.",
      );
    payment.data = { ...payment.data, orderId: order.id };
    await payment.save();
    return {
      orderId: order.id,
      keyId: getServerEnv().RAZORPAY_KEY_ID,
      amountMinor: amount,
    };
  } catch (e) {
    payment.status = "setup-failed";
    await payment.save();
    throw e;
  }
}
export async function createRecurring(
  amount: number,
  actor: NgoActor,
  email: string,
  name: string,
) {
  assertGatewayReady();
  await requireNgoDatabase();
  const active = await NgoRecordModel.findOne({
    module: "recurring-donations",
    ownerId: actor.id,
    status: {
      $in: [
        "creating",
        "created",
        "authenticated",
        "active",
        "paused",
        "pending",
        "halted",
      ],
    },
    deletedAt: null,
  });
  if (active)
    throw new ApiError(
      409,
      "SUBSCRIPTION_EXISTS",
      "Manage your existing recurring donation before creating another.",
    );
  const doc = await NgoRecordModel.create({
    ...recordInput(
      "recurring-donations",
      { name, email, amount, date: new Date().toISOString().slice(0, 10) },
      "creating",
      actor.id,
      actor.id,
    ),
    identityKey: `recurring:${actor.id}`,
  });
  try {
    const plan = await gatewayRequest("plans", {
      period: "monthly",
      interval: 1,
      item: {
        name: "Monthly foundation donation",
        amount: Math.round(amount * 100),
        currency: "INR",
      },
    });
    if (typeof plan.id !== "string") throw new Error("Invalid gateway plan");
    const sub = await gatewayRequest("subscriptions", {
      plan_id: plan.id,
      total_count: 120,
      quantity: 1,
      customer_notify: 0,
      notes: { ngoSubscriptionId: doc._id.toString() },
    });
    if (typeof sub.id !== "string" || !String(sub.id).startsWith("sub_"))
      throw new Error("Invalid gateway subscription");
    doc.data = { ...doc.data, subscriptionId: sub.id, planId: plan.id };
    doc.status = String(sub.status ?? "created");
    await doc.save();
    return {
      subscriptionId: sub.id,
      keyId: getServerEnv().RAZORPAY_KEY_ID,
      id: doc._id.toString(),
    };
  } catch (e) {
    doc.status = "setup-failed";
    doc.identityKey = undefined;
    await doc.save();
    throw e;
  }
}
export async function manageRecurring(
  id: string,
  action: string,
  actor: NgoActor,
) {
  await requireNgoDatabase();
  const doc = await NgoRecordModel.findOne({
    _id: id,
    module: "recurring-donations",
    deletedAt: null,
    ...(actor.admin ? {} : { ownerId: actor.id }),
  });
  if (!doc || !doc.data.subscriptionId)
    throw new ApiError(404, "NOT_FOUND", "Subscription not found.");
  const subscriptionId = String(doc.data.subscriptionId);
  if (!/^sub_[a-zA-Z0-9]+$/.test(subscriptionId))
    throw new ApiError(
      409,
      "INVALID_SUBSCRIPTION",
      "Subscription identifier is invalid.",
    );
  const body =
    action === "pause"
      ? { pause_at: "now" }
      : action === "resume"
        ? { resume_at: "now" }
        : { cancel_at_cycle_end: 0 };
  const result = await gatewayRequest(
    `subscriptions/${subscriptionId}/${action}`,
    body,
  );
  doc.status = String(result.status);
  doc.updatedBy = actor.id;
  if (["cancelled", "completed"].includes(doc.status))
    doc.identityKey = undefined;
  await doc.save();
  await NgoAuditModel.create({
    actor: actor.id,
    action: `subscription-${action}`,
    module: "recurring-donations",
    recordId: id,
    reference: doc.reference,
    fields: ["status"],
  });
  return { status: doc.status };
}
function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
export async function handleNgoWebhook(
  payload: unknown,
  eventId: string | undefined,
  raw: string,
) {
  const root = obj(payload),
    event = String(root.event ?? ""),
    entities = obj(root.payload),
    payment = obj(obj(entities.payment).entity),
    subscription = obj(obj(entities.subscription).entity),
    order = obj(obj(entities.order).entity);
  await requireNgoDatabase();
  const orderId = String(payment.order_id ?? order.id ?? "");
  let target = orderId
    ? await NgoRecordModel.findOne({
        module: "gateway-payments",
        "data.orderId": orderId,
      })
    : null;
  if (!target && subscription.id)
    target = await NgoRecordModel.findOne({
      module: "recurring-donations",
      "data.subscriptionId": String(subscription.id),
    });
  if (!target) return false;
  const key = `gateway-event:${eventId ?? createHash("sha256").update(raw).digest("hex")}`;
  const db = await requireNgoDatabase(),
    session = await db.startSession();
  try {
    await session.withTransaction(async () => {
      if (await NgoRecordModel.exists({ identityKey: key }).session(session))
        return;
      const current = await NgoRecordModel.findById(target!._id).session(
        session,
      );
      if (!current)
        throw new ApiError(404, "NOT_FOUND", "Payment register not found.");
      if (
        current.module === "gateway-payments" &&
        ["payment.captured", "order.paid"].includes(event)
      ) {
        const expected = Number(current.data.amountMinor),
          actual = Number(payment.amount ?? order.amount_paid);
        if (
          actual !== expected ||
          String(payment.currency ?? order.currency) !== "INR" ||
          (payment.status && payment.status !== "captured")
        )
          throw new ApiError(
            409,
            "PAYMENT_MISMATCH",
            "The payment amount or status does not match this registration.",
          );
        const source = await NgoRecordModel.findById(
          String(current.data.source),
        ).session(session);
        if (!source)
          throw new ApiError(404, "NOT_FOUND", "Payment source not found.");
        if (current.status !== "paid") {
          const [fee] = await NgoRecordModel.create(
            [
              {
                ...recordInput(
                  "membership-payments",
                  {
                    name: String(source.data.name),
                    email: String(source.data.email),
                    sourceModule: source.module,
                    source: source._id.toString(),
                    amount: expected / 100,
                    date: new Date().toISOString().slice(0, 10),
                    method: "razorpay",
                    transaction: String(payment.id ?? order.id),
                  },
                  "confirmed",
                  "gateway",
                  source.ownerId,
                ),
                identityKey: `gateway-fee:${current._id}`,
              },
            ],
            { session },
          );
          await applyRecordEffects(fee, undefined, session);
          await fee.save({ session });
          current.status = "paid";
          current.data = {
            ...current.data,
            paymentId: String(payment.id ?? order.id),
          };
        }
      } else if (
        current.module === "gateway-payments" &&
        event === "payment.failed" &&
        current.status !== "paid"
      )
        current.status = "failed";
      if (
        current.module === "recurring-donations" &&
        event.startsWith("subscription.")
      ) {
        const remote = await gatewayRequest(
          `subscriptions/${String(current.data.subscriptionId)}`,
        );
        current.status = String(remote.status);
        if (["cancelled", "completed"].includes(current.status))
          current.identityKey = undefined;
        if (event === "subscription.charged") {
          const amount = Math.round(Number(current.data.amount) * 100);
          if (
            Number(payment.amount) !== amount ||
            payment.currency !== "INR" ||
            payment.status !== "captured" ||
            typeof payment.id !== "string"
          )
            throw new ApiError(
              409,
              "PAYMENT_MISMATCH",
              "The recurring charge could not be reconciled.",
            );
          const identity = `recurring-charge:${payment.id}`;
          if (
            !(await DonationModel.exists({ idempotencyKey: identity }).session(
              session,
            ))
          ) {
            const [donation] = await DonationModel.create(
              [
                {
                  amountMinor: amount,
                  currency: "INR",
                  frequency: "monthly",
                  provider: "razorpay",
                  donor: { name: current.data.name, email: current.data.email },
                  anonymous: false,
                  consent: true,
                  accountUserId: current.ownerId,
                  status: "paid",
                  paidAt: new Date(),
                  externalPaymentId: payment.id,
                  externalOrderId: String(payment.order_id ?? ""),
                  idempotencyKey: identity,
                  requestId: key.slice(0, 100),
                },
              ],
              { session },
            );
            await onlineReceipt(donation._id.toString(), session);
          }
        }
      }
      current.revision++;
      await current.save({ session });
      await NgoRecordModel.create(
        [
          {
            ...recordInput(
              "gateway-events",
              { event, target: current._id.toString() },
              "processed",
              "gateway",
            ),
            identityKey: key,
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
  return true;
}
export async function onlineReceipt(
  donationId: string,
  session?: import("mongoose").ClientSession,
  sendEmail = true,
) {
  const donation = await DonationModel.findById(donationId).session(
    session ?? null,
  );
  if (!donation || donation.status !== "paid") return;
  const key = `online-receipt:${donation._id}`;
  if (
    await NgoRecordModel.exists({ identityKey: key }).session(session ?? null)
  )
    return;
  const data = {
    name: donation.donor.name,
    email: donation.donor.email,
    title: "Donation receipt",
    type: "donation-receipt",
    source: donation._id.toString(),
    sourceModule: "online-donations",
    date: (donation.paidAt ?? donation.createdAt).toISOString().slice(0, 10),
    amount: donation.amountMinor / 100,
    method: donation.provider,
    transaction: donation.externalPaymentId ?? "",
    content:
      "Acknowledgement of a provider-confirmed contribution. No tax-exemption eligibility is implied.",
    template: "classic",
  };
  const [doc] = await NgoRecordModel.create(
    [
      {
        ...recordInput(
          "documents",
          data,
          "issued",
          "gateway",
          donation.accountUserId,
        ),
        identityKey: key,
      },
    ],
    { session },
  );
  if (sendEmail)
    await queueEmail(
      `issue:${doc._id}`,
      data.email,
      "Skymeredian Foundation donation receipt",
      `Your donation receipt ${doc.reference} is attached.`,
      doc._id.toString(),
      session,
    );
}
