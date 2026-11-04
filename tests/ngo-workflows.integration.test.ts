import { it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));
import { loadEnvConfig } from "@next/env";
import { randomBytes } from "node:crypto";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const database = `ngo_qa_${randomBytes(8).toString("hex")}`;

async function main() {
  loadEnvConfig(process.cwd());
  const { parse } = await import("dotenv");
  Object.assign(process.env, parse(await readFile(".env.local", "utf8")));
  process.env.MONGODB_DB_NAME = database;
  process.env.DEMO_MODE = "false";
  process.env.DONATIONS_ENABLED = "false";
  process.env.RESEND_API_KEY = "";
  process.env.NEXT_PUBLIC_SITE_URL = "https://skymeredianfoundation.org";
  const { default: mongoose } = await import("mongoose");
  const { NgoRecordModel, NgoAuditModel, NgoDeliveryModel } =
    await import("../src/models/NgoRecord");
  const { DonationModel } = await import("../src/models/Donation");
  const { saveRecord, listFilter } =
    await import("../src/lib/server/ngo/records");
  const { requireNgoDatabase } = await import("../src/lib/server/ngo/access");
  const { documentValidity, renderNgoDocument } =
    await import("../src/lib/server/ngo/documents");
  const { publishedRecords } = await import("../src/lib/server/ngo/public");
  const { reportRows, exportWorkbook, exportReportPdf } =
    await import("../src/lib/server/ngo/reports");
  const { handleNgoWebhook, onlineReceipt } =
    await import("../src/lib/server/ngo/payments");
  const admin = { id: "qa-admin", admin: true };
  let connected = false;
  const checks: string[] = [];
  try {
    const db = await requireNgoDatabase();
    assert.equal(db.connection.db!.databaseName, database);
    connected = true;
    await Promise.all([
      NgoRecordModel.init(),
      NgoAuditModel.init(),
      NgoDeliveryModel.init(),
      DonationModel.init(),
    ]);
    await NgoRecordModel.create({
      module: "organization",
      reference: "QA-ORGANIZATION",
      verifyToken: randomBytes(32).toString("hex"),
      downloadToken: randomBytes(32).toString("hex"),
      status: "active",
      data: {
        name: "QA ONLY organization",
        address: "QA ONLY isolated test address",
        signatory: "QA ONLY test signer",
      },
      createdBy: "qa",
      updatedBy: "qa",
    });
    const designation = await saveRecord(
      "designations",
      {
        status: "active",
        data: { name: "QA Member", fee: 500, termMonths: 12 },
      },
      admin,
    );
    const memberData = {
      name: "Anita Sharma",
      email: "anita@example.invalid",
      accountUserId: "qa-member",
      designation: designation.id,
      dateOfBirth: "1990-05-10",
      address: "QA address",
    };
    let member = await saveRecord(
      "members",
      { status: "pending", data: memberData },
      admin,
    );
    await assert.rejects(
      () =>
        saveRecord(
          "members",
          { status: "approved", revision: member.revision, data: memberData },
          admin,
          member.id,
        ),
      (e) =>
        e instanceof Error && "code" in e && e.code === "MEMBERSHIP_FEE_UNPAID",
    );
    checks.push("unpaid membership cannot be approved");
    const feeBase = {
      name: "Anita Sharma",
      email: "anita@example.invalid",
      sourceModule: "members",
      source: member.reference,
      date: "2026-11-05",
      method: "cash",
    };
    await assert.rejects(
      () =>
        saveRecord(
          "membership-payments",
          { status: "confirmed", data: { ...feeBase, amount: 499 } },
          admin,
        ),
      (e) => e instanceof Error && "code" in e && e.code === "AMOUNT_MISMATCH",
    );
    checks.push("fee amount mismatch rolls back");
    await saveRecord(
      "membership-payments",
      { status: "confirmed", data: { ...feeBase, amount: 500 } },
      admin,
    );
    let current = await NgoRecordModel.findById(member.id);
    assert.equal(current!.data._paymentStatus, "paid");
    member = await saveRecord(
      "members",
      { status: "approved", revision: current!.revision, data: memberData },
      admin,
      member.id,
    );
    assert.equal(
      await NgoRecordModel.countDocuments({
        module: "documents",
        ownerId: "qa-member",
        status: "issued",
      }),
      4,
    );
    checks.push(
      "paid approval issues receipt, ID, appointment and certificate",
    );
    const certificate = await NgoRecordModel.findOne({
      module: "documents",
      "data.type": "membership-certificate",
      ownerId: "qa-member",
    });
    assert.equal(await documentValidity(certificate!), true);
    member = await saveRecord(
      "members",
      { status: "blocked", revision: member.revision, data: memberData },
      admin,
      member.id,
    );
    assert.equal(await documentValidity(certificate!), false);
    current = await NgoRecordModel.findById(member.id);
    member = await saveRecord(
      "members",
      { status: "approved", revision: current!.revision, data: memberData },
      admin,
      member.id,
    );
    checks.push(
      "blocking invalidates QR, unblocking preserves revoked originals",
    );
    const oldExpiry = String(member.data._expires);
    let renewal = await saveRecord(
      "renewals",
      {
        status: "pending",
        data: {
          name: "Anita Sharma",
          email: "anita@example.invalid",
          member: member.id,
          designation: designation.id,
        },
      },
      admin,
    );
    await assert.rejects(() =>
      saveRecord(
        "renewals",
        {
          status: "approved",
          revision: renewal.revision,
          data: Object.fromEntries(
            Object.entries(renewal.data).filter(([k]) => !k.startsWith("_")),
          ),
        },
        admin,
        renewal.id,
      ),
    );
    await saveRecord(
      "membership-payments",
      {
        status: "confirmed",
        data: {
          ...feeBase,
          sourceModule: "renewals",
          source: renewal.id,
          amount: 500,
        },
      },
      admin,
    );
    const pendingRenewal = await NgoRecordModel.findById(renewal.id);
    renewal = await saveRecord(
      "renewals",
      {
        status: "approved",
        revision: pendingRenewal!.revision,
        data: Object.fromEntries(
          Object.entries(renewal.data).filter(([k]) => !k.startsWith("_")),
        ),
      },
      admin,
      renewal.id,
    );
    assert(
      String((await NgoRecordModel.findById(member.id))!.data._expires) >
        oldExpiry,
    );
    checks.push("paid renewal extends existing expiry after admin approval");
    const coordinator = await saveRecord(
      "coordinators",
      {
        status: "active",
        data: {
          name: "QA Coordinator",
          email: "coord@example.invalid",
          accountUserId: "qa-coordinator",
          location: "QA area",
        },
      },
      admin,
    );
    const field = {
      id: "qa-coordinator",
      admin: false,
      coordinator: coordinator.id,
    };
    const giftData = {
      name: "QA Donor",
      email: "donor@example.invalid",
      amount: 250,
      date: "2026-11-05",
      method: "cash",
      purpose: "QA contribution",
    };
    await assert.rejects(
      () =>
        saveRecord(
          "offline-donations",
          { status: "confirmed", data: giftData },
          field,
        ),
      (e) => e instanceof Error && "status" in e && e.status === 403,
    );
    const gift = await saveRecord(
      "offline-donations",
      { status: "pending", data: giftData },
      field,
    );
    await saveRecord(
      "offline-donations",
      { status: "confirmed", revision: gift.revision, data: giftData },
      admin,
      gift.id,
    );
    assert.equal(
      await NgoRecordModel.countDocuments({
        module: "documents",
        "data.source": gift.id,
      }),
      1,
    );
    const own = listFilter("offline-donations", new URLSearchParams(), field);
    assert.equal(await NgoRecordModel.countDocuments(own), 1);
    assert.equal(
      await NgoRecordModel.countDocuments(
        listFilter("offline-donations", new URLSearchParams(), {
          id: "qa-other",
          admin: false,
          coordinator: "000000000000000000000001",
        }),
      ),
      0,
    );
    checks.push("coordinator isolation and finance approval");
    const team = await saveRecord(
      "team",
      {
        status: "draft",
        data: {
          name: "QA Trustee",
          designation: "Trustee",
          group: "Management body",
          bio: "Test biography",
        },
      },
      admin,
    );
    assert.equal((await publishedRecords("team")).length, 0);
    await saveRecord(
      "team",
      { status: "published", revision: team.revision, data: team.data },
      admin,
      team.id,
    );
    assert.equal((await publishedRecords("team")).length, 1);
    checks.push("publishing reads only published database records");
    const { headers, rows, definition } = await reportRows(
      "members",
      new URLSearchParams(),
      admin,
    );
    assert.equal(rows.length, 1);
    const workbook = await exportWorkbook(headers, rows, definition.title);
    assert.equal(workbook.subarray(0, 2).toString(), "PK");
    const pdfReport = await exportReportPdf(headers, rows, definition.title);
    assert.equal(pdfReport.subarray(0, 4).toString(), "%PDF");
    checks.push("real Excel and full PDF exports");
    await mkdir("scratch/ngo-pdf-qa", { recursive: true });
    for (const template of [
      "classic",
      "modern",
      "heritage",
      "minimal",
      "honour",
      "executive",
    ]) {
      const doc = new NgoRecordModel({
        module: "certificates",
        reference: `QA-${template}`,
        status: "issued",
        data: {
          name: "अनिता शर्मा / Anita Sharma",
          title: "Community Service Certificate",
          content:
            "In recognition of dedicated community service and thoughtful participation in foundation activities.",
          date: "2026-11-05",
          template,
          type: "visitor-certificate",
          signatory: "QA signatory",
        },
        verifyToken: "a".repeat(64),
        downloadToken: "b".repeat(64),
        createdBy: "qa",
        updatedBy: "qa",
      });
      const pdf = await renderNgoDocument(doc);
      assert(pdf.length > 1000);
      await writeFile(`scratch/ngo-pdf-qa/${template}.pdf`, pdf);
    }
    checks.push("six certificate layouts render Latin and Devanagari text");
    const source = await saveRecord(
      "members",
      {
        status: "pending",
        data: {
          ...memberData,
          email: "second@example.invalid",
          accountUserId: "qa-second",
        },
      },
      admin,
    );
    const gateway = await NgoRecordModel.create({
      module: "gateway-payments",
      reference: "QA-ORDER",
      identityKey: "qa-order",
      status: "pending",
      ownerId: "qa-second",
      createdBy: "qa",
      updatedBy: "qa",
      data: {
        orderId: "order_QA123456",
        source: source.id,
        sourceModule: "members",
        amountMinor: 50000,
      },
      verifyToken: "c".repeat(64),
      downloadToken: "d".repeat(64),
    });
    const payload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_QA123456",
            order_id: "order_QA123456",
            amount: 50000,
            currency: "INR",
            status: "captured",
          },
        },
      },
    };
    assert.equal(
      await handleNgoWebhook(payload, "qa-event-1", JSON.stringify(payload)),
      true,
    );
    assert.equal(
      await handleNgoWebhook(payload, "qa-event-1", JSON.stringify(payload)),
      true,
    );
    assert.equal(
      await NgoRecordModel.countDocuments({
        module: "membership-payments",
        "data.source": source.id,
      }),
      1,
    );
    assert.equal((await NgoRecordModel.findById(gateway._id))!.status, "paid");
    checks.push("captured registration payment is reconciled exactly once");
    const paid = await DonationModel.create({
      amountMinor: 10000,
      currency: "INR",
      frequency: "one_time",
      provider: "razorpay",
      donor: { name: "QA Donor", email: "giving@example.invalid" },
      consent: true,
      anonymous: false,
      status: "paid",
      paidAt: new Date(),
      requestId: "qa",
      accountUserId: "qa-donor",
    });
    await onlineReceipt(paid._id.toString(), undefined, false);
    const receipt = await NgoRecordModel.findOne({
      identityKey: `online-receipt:${paid._id}`,
    });
    assert.equal(await documentValidity(receipt!), true);
    paid.status = "refunded";
    await paid.save();
    assert.equal(await documentValidity(receipt!), false);
    checks.push("refunded donation cannot verify as a valid paid receipt");
    assert((await NgoAuditModel.countDocuments({})) >= 10);
    console.log(JSON.stringify({ database, passed: checks.length, checks }));
  } finally {
    if (
      connected &&
      mongoose.connection.db?.databaseName === database &&
      database.startsWith("ngo_qa_")
    )
      await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  }
}

it.skipIf(process.env.NGO_INTEGRATION_TEST !== "1")(
  "runs the NGO workflow against an isolated disposable database",
  async () => {
    await main();
  },
  120000,
);
