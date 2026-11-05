import "server-only";
import { createHash } from "node:crypto";
import { NgoRecordModel, NgoAuditModel } from "@/models/NgoRecord";
import { DonationModel } from "@/models/Donation";
import { ApiError } from "../errors";
import {
  getVerifiedSiteOrigin,
  isProductionRuntime,
  isDonationsEnabled,
} from "../env";
import { requireNgoDatabase, type NgoActor } from "./access";
import { recordInput, applyRecordEffects } from "./records";
import { onlineReceipt } from "./payments";
import {
  assertHostedConfigured,
  hostedCredentials,
  type GatewayMode,
  type Gateway,
} from "./gateway-config";
export const sha512 = (value: string) =>
  createHash("sha512").update(value).digest("hex");
export function payuFields(
  key: string,
  salt: string,
  order: string,
  amountMinor: number,
  name: string,
  email: string,
  phone: string,
  callback: string,
) {
  const fields: Record<string, string> = {
    key,
    txnid: order,
    amount: (amountMinor / 100).toFixed(2),
    productinfo: "Skymeredian Foundation contribution",
    firstname: name,
    email,
    phone,
    surl: callback,
    furl: callback,
  };
  fields.hash = sha512(
    [
      key,
      order,
      fields.amount,
      fields.productinfo,
      name,
      email,
      ...Array(10).fill(""),
      salt,
    ].join("|"),
  );
  return fields;
}
async function checkedJson(url: string, init: RequestInit) {
  const r = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!r.ok)
    throw new ApiError(
      502,
      "GATEWAY_REQUEST_FAILED",
      "The provider could not process this request. No payment is confirmed.",
    );
  return (await r.json()) as Record<string, unknown>;
}
async function phonepeToken(mode: GatewayMode) {
  const c = assertHostedConfigured("phonepe", mode);
  const data = await checkedJson(
    mode === "production"
      ? "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
      : "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: c.key,
        client_secret: c.secret,
        client_version: c.version!,
        grant_type: "client_credentials",
      }),
    },
  );
  if (typeof data.access_token !== "string")
    throw new ApiError(
      502,
      "INVALID_GATEWAY_RESPONSE",
      "Invalid gateway authentication response.",
    );
  return data.access_token;
}
const phonepeBase = (mode: GatewayMode) =>
  mode === "production"
    ? "https://api.phonepe.com/apis/pg"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox";
export function validHostedRedirect(provider: string, url: string) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      !(parsed.username || parsed.password) &&
      (provider === "phonepe"
        ? parsed.hostname === "phonepe.com" ||
          parsed.hostname.endsWith(".phonepe.com")
        : parsed.hostname === "secure.payu.in" ||
          parsed.hostname === "test.payu.in")
    );
  } catch {
    return false;
  }
}
export async function startHostedPayment(
  sourceId: string,
  sourceModule: string,
  actor: NgoActor,
  provider: Exclude<Gateway, "razorpay">,
  mode: GatewayMode,
): Promise<{
  provider: string;
  status: "requires_action";
  postUrl?: string;
  fields?: Record<string, string>;
  redirectUrl?: string;
}> {
  if (!isDonationsEnabled())
    throw new ApiError(
      503,
      "DONATIONS_DISABLED",
      "Online collection is currently disabled.",
    );
  if (isProductionRuntime() && mode !== "production")
    throw new ApiError(
      409,
      "SANDBOX_COLLECTION_DISABLED",
      "Sandbox payments cannot collect real donations on the production website.",
    );
  assertHostedConfigured(provider, mode);
  await requireNgoDatabase();
  let name: string,
    email: string,
    phone: string,
    amountMinor: number,
    owner: string | undefined;
  if (sourceModule === "online-donations") {
    const d = await DonationModel.findOne({ _id: sourceId, provider });
    if (!d || ["paid", "refunded", "cancelled"].includes(d.status))
      throw new ApiError(
        409,
        "PAYMENT_NOT_DUE",
        "This donation cannot start a new payment.",
      );
    name = d.donor.name;
    email = d.donor.email;
    phone = d.donor.phone ?? "";
    amountMinor = d.amountMinor;
    owner = d.accountUserId;
  } else {
    const d = await NgoRecordModel.findOne({
      _id: sourceId,
      module: { $in: ["members", "renewals", "registrations", "applications"] },
      ownerId: actor.id,
      deletedAt: null,
    });
    if (
      !d ||
      d.data._provisional === true ||
      d.data._paymentStatus === "paid" ||
      ["blocked", "cancelled", "rejected", "expired"].includes(d.status)
    )
      throw new ApiError(
        409,
        "PAYMENT_NOT_DUE",
        "No payable registration was found.",
      );
    name = String(d.data.name);
    email = String(d.data.email);
    phone = String(d.data.phone ?? "");
    amountMinor = Number(d.data._feeMinor);
    owner = d.ownerId;
    sourceModule = d.module;
  }
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 100)
    throw new ApiError(
      422,
      "INVALID_AMOUNT",
      "A valid fee of at least INR 1 is required.",
    );
  if (provider === "payu" && !/^\+?[0-9 ()-]{7,25}$/.test(phone))
    throw new ApiError(
      422,
      "PHONE_REQUIRED",
      "PayU requires the payer's phone number.",
    );
  const key =
    sourceModule === "online-donations"
      ? `hosted-checkout:${sourceModule}:${sourceId}`
      : `checkout:${sourceId}`;
  let payment = await NgoRecordModel.findOne({ identityKey: key });
  if (!payment) {
    payment = await NgoRecordModel.findOneAndUpdate(
      { identityKey: key },
      {
        $setOnInsert: {
          ...recordInput(
            "gateway-payments",
            {
              name,
              email,
              phone,
              source: sourceId,
              sourceModule,
              provider,
              environment: mode,
              amountMinor,
            },
            "pending",
            actor.id,
            owner,
          ),
          identityKey: key,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
  if (!payment)
    throw new ApiError(
      409,
      "PAYMENT_CHANGED",
      "The checkout changed. Please retry.",
    );
  if (payment.data.provider !== provider || payment.data.environment !== mode)
    throw new ApiError(
      409,
      "EXISTING_CHECKOUT_PROVIDER",
      "This registration has an existing checkout with another provider. Reconcile it before switching.",
    );
  if (payment.status === "paid")
    throw new ApiError(
      409,
      "PAYMENT_NOT_DUE",
      "This payment is already confirmed.",
    );
  const expired =
    provider === "phonepe" &&
    payment.data.redirectUrl &&
    Number(payment.data.checkoutExpiry) <= Date.now();
  if (payment.status === "failed" || expired) {
    const verified = await reconcileHostedPayment(
      payment._id.toString(),
      payment.downloadToken,
    );
    if (verified.status === "paid")
      throw new ApiError(
        409,
        "PAYMENT_NOT_DUE",
        "Your payment has been confirmed. Refresh your dashboard.",
      );
    if (verified.status !== "failed")
      throw new ApiError(
        409,
        "PAYMENT_RECONCILING",
        "The previous payment is still pending with the provider. Please retry after its final status is confirmed.",
      );
    // Preserve the failed attempt and its callback credentials. Release only a
    // provider-confirmed terminal failure, so an unpaid source can safely retry.
    const released = await NgoRecordModel.updateOne(
      { _id: payment._id, identityKey: key, status: "failed" },
      { $unset: { identityKey: "" } },
    );
    if (!released.modifiedCount)
      throw new ApiError(
        409,
        "PAYMENT_CHANGED",
        "Payment status changed. Please refresh before trying again.",
      );
    return startHostedPayment(sourceId, sourceModule, actor, provider, mode);
  }
  const origin = getVerifiedSiteOrigin();
  if (!origin)
    throw new ApiError(
      503,
      "SITE_ORIGIN_REQUIRED",
      "Configure the verified website origin.",
    );
  const callback = `${origin}/api/payments/hosted/callback/${provider}?payment=${payment._id}&token=${payment.downloadToken}`;
  const order = `NGO_${payment._id}`;
  if (sourceModule === "online-donations")
    await DonationModel.updateOne(
      { _id: sourceId, status: { $in: ["pending", "failed"] } },
      { $set: { status: "processing", externalOrderId: order } },
    );
  if (provider === "payu") {
    const c = hostedCredentials(provider, mode);
    return {
      provider,
      status: "requires_action" as const,
      postUrl:
        mode === "production"
          ? "https://secure.payu.in/_payment"
          : "https://test.payu.in/_payment",
      fields: payuFields(
        c.key!,
        c.secret!,
        order,
        amountMinor,
        name,
        email,
        phone,
        callback,
      ),
    };
  }
  if (
    payment.data.redirectUrl &&
    Number(payment.data.checkoutExpiry) > Date.now()
  )
    return {
      provider,
      status: "requires_action" as const,
      redirectUrl: String(payment.data.redirectUrl),
    };
  const token = await phonepeToken(mode);
  const result = await checkedJson(`${phonepeBase(mode)}/checkout/v2/pay`, {
    method: "POST",
    headers: {
      Authorization: `O-Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchantOrderId: order,
      amount: amountMinor,
      expireAfter: 1200,
      paymentFlow: {
        type: "PG_CHECKOUT",
        merchantUrls: { redirectUrl: callback },
      },
    }),
  });
  if (
    typeof result.redirectUrl !== "string" ||
    !validHostedRedirect(provider, result.redirectUrl)
  )
    throw new ApiError(
      502,
      "INVALID_GATEWAY_RESPONSE",
      "The gateway returned an invalid checkout address.",
    );
  payment.data = {
    ...payment.data,
    redirectUrl: result.redirectUrl,
    checkoutExpiry: Date.now() + 1200000,
  };
  await payment.save();
  return {
    provider,
    status: "requires_action" as const,
    redirectUrl: result.redirectUrl,
  };
}
export async function reconcileHostedPayment(id: string, token: string) {
  await requireNgoDatabase();
  const payment = await NgoRecordModel.findOne({
    _id: id,
    module: "gateway-payments",
    downloadToken: token,
  });
  if (!payment)
    throw new ApiError(404, "NOT_FOUND", "Payment reference not found.");
  if (payment.status === "paid") return { status: "paid" };
  const provider = String(payment.data.provider),
    mode = String(payment.data.environment) as GatewayMode,
    order = `NGO_${payment._id}`;
  let state = "pending",
    actual = 0,
    paymentId = "";
  if (provider === "phonepe") {
    const access = await phonepeToken(mode);
    const result = await checkedJson(
      `${phonepeBase(mode)}/checkout/v2/order/${order}/status?details=true`,
      { headers: { Authorization: `O-Bearer ${access}` } },
    );
    state =
      result.state === "COMPLETED"
        ? "paid"
        : result.state === "FAILED"
          ? "failed"
          : "pending";
    actual = Number(result.amount);
    const details = result.paymentDetails as
      Array<{ state?: string; transactionId?: string }> | undefined;
    paymentId =
      details?.find((d) => d.state === "COMPLETED")?.transactionId ??
      String(result.orderId ?? "");
  } else if (provider === "payu") {
    const c = assertHostedConfigured("payu", mode);
    const data = await checkedJson(
      mode === "production"
        ? "https://info.payu.in/merchant/postservice.php?form=2"
        : "https://test.payu.in/merchant/postservice.php?form=2",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          key: c.key,
          command: "verify_payment",
          var1: order,
          hash: sha512(`${c.key}|verify_payment|${order}|${c.secret}`),
        }),
      },
    );
    const details = data.transaction_details as
      | Record<
          string,
          {
            status?: string;
            unmappedstatus?: string;
            transaction_amount?: string;
            amt?: string;
            mihpayid?: string;
          }
        >
      | undefined;
    const result = details?.[order];
    state =
      result?.status === "success" && result.unmappedstatus === "captured"
        ? "paid"
        : result?.status === "failure"
          ? "failed"
          : "pending";
    actual = Math.round(
      Number(result?.transaction_amount ?? result?.amt) * 100,
    );
    paymentId = result?.mihpayid ?? "";
  } else
    throw new ApiError(422, "INVALID_PROVIDER", "Unsupported hosted provider.");
  if (
    state === "paid" &&
    (actual !== Number(payment.data.amountMinor) || !paymentId)
  )
    throw new ApiError(
      409,
      "PAYMENT_MISMATCH",
      "Provider-confirmed amount or payment identity did not match.",
    );
  const db = await requireNgoDatabase(),
    session = await db.startSession();
  try {
    await session.withTransaction(async () => {
      const current = await NgoRecordModel.findById(id).session(session);
      if (!current || current.status === "paid") return;
      if (state === "paid") {
        if (current.data.sourceModule === "online-donations") {
          const donor = await DonationModel.findOne({
            _id: String(current.data.source),
            provider,
            amountMinor: actual,
          }).session(session);
          if (!donor)
            throw new ApiError(
              409,
              "PAYMENT_MISMATCH",
              "Donation reference did not match.",
            );
          if (!["paid", "refunded"].includes(donor.status)) {
            donor.status = "paid";
            donor.paidAt = new Date();
            donor.externalOrderId = order;
            donor.externalPaymentId = paymentId;
            await donor.save({ session });
            await onlineReceipt(donor._id.toString(), session);
          }
        } else {
          const source = await NgoRecordModel.findById(
            String(current.data.source),
          ).session(session);
          if (!source)
            throw new ApiError(404, "NOT_FOUND", "Registration not found.");
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
                    amount: actual / 100,
                    date: new Date().toISOString().slice(0, 10),
                    method: provider,
                    transaction: paymentId,
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
        }
      }
      if (
        state === "failed" &&
        current.data.sourceModule === "online-donations"
      )
        await DonationModel.updateOne(
          {
            _id: String(current.data.source),
            status: { $in: ["pending", "processing"] },
          },
          {
            $set: { status: "failed", failureCode: "provider_payment_failed" },
          },
          { session },
        );
      current.status = state;
      current.data = { ...current.data, paymentId };
      current.revision++;
      await current.save({ session });
      await NgoAuditModel.create(
        [
          {
            actor: "gateway",
            action: "provider-status-verified",
            module: "gateway-payments",
            recordId: id,
            reference: current.reference,
            fields: [`status:${state}`],
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
  return { status: state };
}

export async function reconcilePendingHostedPayments(limit = 10) {
  await requireNgoDatabase();
  const pending = await NgoRecordModel.find({
    module: "gateway-payments",
    status: "pending",
    "data.provider": { $in: ["phonepe", "payu"] },
    createdAt: { $lt: new Date(Date.now() - 60000) },
  })
    .sort({ updatedAt: 1 })
    .limit(limit);
  let checked = 0;
  for (const item of pending) {
    try {
      await reconcileHostedPayment(item._id.toString(), item.downloadToken);
      checked++;
    } catch {
      await NgoRecordModel.updateOne(
        { _id: item._id },
        { $set: { updatedAt: new Date() } },
      );
    }
  }
  return { checked };
}
