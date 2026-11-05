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
      {
        status: "confirmed",
        revision: gift.revision,
        data: { ...gift.data, ...giftData },
      },
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
    const provisional = await saveRecord(
      "designations",
      {
        status: "active",
        data: {
          name: "PROVISIONAL QA category",
          fee: 0,
          termMonths: 1,
          provisional: true,
        },
      },
      admin,
    );
    const testMember = await saveRecord(
      "members",
      {
        status: "approved",
        data: {
          ...memberData,
          accountUserId: "qa-provisional",
          designation: provisional.id,
        },
      },
      admin,
    );
    const testDocs = await NgoRecordModel.find({
      module: "documents",
      "data.source": testMember.id,
    });
    assert.equal(testDocs.length, 3);
    assert(
      testDocs.every(
        (d) => d.status === "draft" && d.data._provisional === true,
      ),
    );
    assert.equal(await documentValidity(testDocs[0]), false);
    assert((await renderNgoDocument(testDocs[0])).length > 1000);
    checks.push(
      "provisional test categories issue only invalid-for-official-use draft documents",
    );

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

    const project = await saveRecord(
      "projects",
      {
        status: "active",
        data: {
          name: "QA public project",
          description: "QA project accounting",
          startDate: "2026-01-01",
          progress: 25,
          publish: true,
        },
      },
      admin,
    );
    await saveRecord(
      "offline-donations",
      {
        status: "confirmed",
        data: {
          ...giftData,
          amount: 300,
          project: project.id,
          referredBy: member.id,
        },
      },
      admin,
    );
    await saveRecord(
      "expenses",
      {
        status: "approved",
        data: {
          name: "QA travel",
          category: "Travel",
          amount: 50,
          date: "2026-11-05",
          payee: "QA payee",
          project: project.id,
        },
      },
      admin,
    );
    const { projectAccounting } =
      await import("../src/lib/server/ngo/project-accounting");
    const projectTotals = (await projectAccounting([project.id]))[project.id];
    assert.equal(projectTotals.incomeMinor, 30000);
    assert.equal(projectTotals.expenseMinor, 5000);
    assert.equal(projectTotals.categories[0].category, "Travel");
    const publicProjects = await publishedRecords("projects");
    assert.equal(publicProjects[0].accounting?.expenseMinor, 5000);
    assert(!JSON.stringify(publicProjects).includes("QA payee"));
    checks.push(
      "public project totals and exports use approved accounting without exposing payees",
    );
    const { analyticsRows } = await import("../src/lib/server/ngo/analytics");
    const referralsReport = await analyticsRows(
      "member-referrals",
      new URLSearchParams({ q: member.reference }),
    );
    assert.equal(referralsReport.rows[0].data.amount, 300);
    checks.push(
      "admin referral analytics calculates confirmed donations per member",
    );
    await saveRecord(
      "offline-donations",
      {
        status: "confirmed",
        data: { ...giftData, coordinator: coordinator.id },
      },
      admin,
    );
    const campaign = await saveRecord(
      "campaigns",
      {
        status: "active",
        data: {
          name: "QA campaign",
          description: "QA project campaign",
          goal: 1000,
          startDate: "2026-01-01",
          endDate: "2027-01-01",
          project: project.id,
        },
      },
      admin,
    );
    await DonationModel.create({
      amountMinor: 20000,
      refundedAmountMinor: 5000,
      currency: "INR",
      frequency: "one_time",
      provider: "razorpay",
      donor: { name: "QA Campaign donor", email: "campaign@example.invalid" },
      consent: true,
      anonymous: false,
      status: "paid",
      paidAt: new Date(),
      requestId: "qa-project",
      campaignId: campaign.id,
    });
    const summary = await (
      await import("../src/lib/server/ngo/reports")
    ).financialSummary();
    assert.equal(summary.coordinators[coordinator.id].donors, 1);
    assert.equal(summary.coordinators[coordinator.id].gifts, 2);
    assert.equal(summary.projects[project.id].income, 45000);
    assert.equal(
      (await projectAccounting([project.id]))[project.id].incomeMinor,
      45000,
    );
    checks.push(
      "coordinator reports deduplicate donors and admin project totals include net online campaign gifts",
    );
    const { processMessageBroadcasts } =
      await import("../src/lib/server/ngo/jobs");
    const broadcast = await saveRecord(
      "messages",
      {
        status: "published",
        data: {
          name: "QA member update",
          content: "A private test message",
          audience: "all-members",
          sendEmail: true,
        },
      },
      admin,
    );
    for (let i = 0; i < 10; i++) await processMessageBroadcasts(1);
    const queued = await NgoDeliveryModel.countDocuments({
      key: { $regex: `^message:${broadcast.id}:` },
    });
    assert(queued >= 2);
    await processMessageBroadcasts(1);
    assert.equal(
      await NgoDeliveryModel.countDocuments({
        key: { $regex: `^message:${broadcast.id}:` },
      }),
      queued,
    );
    checks.push(
      "broadcast batches resume and do not duplicate member email jobs",
    );
    const { reconcileHostedPayment } =
      await import("../src/lib/server/ngo/hosted-payments");
    const hostedSource = await saveRecord(
      "members",
      {
        status: "pending",
        data: {
          ...memberData,
          accountUserId: "qa-hosted",
          email: "hosted@example.invalid",
        },
      },
      admin,
    );
    const hosted = await NgoRecordModel.create({
      ...(await import("../src/lib/server/ngo/records")).recordInput(
        "gateway-payments",
        {
          source: hostedSource.id,
          sourceModule: "members",
          provider: "payu",
          environment: "sandbox",
          amountMinor: 50000,
        },
        "pending",
        "qa",
        "qa-hosted",
      ),
      identityKey: "qa-hosted-order",
    });
    process.env.TEST_PAYU_KEY = "qa-merchant";
    process.env.TEST_PAYU_SALT = "qa-only-salt";
    const originalFetch = globalThis.fetch;
    let providerAmount = "499.00";
    globalThis.fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            transaction_details: {
              [`NGO_${hosted._id}`]: {
                status: "success",
                unmappedstatus: "captured",
                transaction_amount: providerAmount,
                mihpayid: "qa_payu_confirmed",
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    ) as typeof fetch;
    try {
      await assert.rejects(
        () =>
          reconcileHostedPayment(hosted._id.toString(), hosted.downloadToken),
        (e) =>
          e instanceof Error && "code" in e && e.code === "PAYMENT_MISMATCH",
      );
      assert.equal(
        (await NgoRecordModel.findById(hostedSource.id))!.data._paymentStatus,
        "unpaid",
      );
      providerAmount = "500.00";
      await reconcileHostedPayment(hosted._id.toString(), hosted.downloadToken);
      await reconcileHostedPayment(hosted._id.toString(), hosted.downloadToken);
      assert.equal(
        await NgoRecordModel.countDocuments({
          module: "membership-payments",
          "data.source": hostedSource.id,
        }),
        1,
      );
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.TEST_PAYU_KEY;
      delete process.env.TEST_PAYU_SALT;
    }
    checks.push(
      "hosted provider status rejects wrong amounts and reconciles exactly once",
    );
    const phonepeSource = await saveRecord(
      "members",
      {
        status: "pending",
        data: {
          ...memberData,
          accountUserId: "qa-phonepe",
          email: "phonepe@example.invalid",
        },
      },
      admin,
    );
    const phonepePayment = await NgoRecordModel.create({
      ...(await import("../src/lib/server/ngo/records")).recordInput(
        "gateway-payments",
        {
          source: phonepeSource.id,
          sourceModule: "members",
          provider: "phonepe",
          environment: "sandbox",
          amountMinor: 50000,
        },
        "pending",
        "qa",
        "qa-phonepe",
      ),
      identityKey: "qa-phonepe-order",
    });
    process.env.TEST_PHONEPE_CLIENT_ID = "qa-client";
    process.env.TEST_PHONEPE_CLIENT_SECRET = "qa-client-secret";
    process.env.TEST_PHONEPE_CLIENT_VERSION = "1";
    globalThis.fetch = vi.fn(
      async (url) =>
        new Response(
          JSON.stringify(
            String(url).includes("oauth/token")
              ? { access_token: "qa-access-token" }
              : {
                  state: "COMPLETED",
                  amount: 50000,
                  orderId: "qa-phonepe-order",
                  paymentDetails: [
                    {
                      state: "COMPLETED",
                      transactionId: "qa-phonepe-transaction",
                    },
                  ],
                },
          ),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    ) as typeof fetch;
    try {
      await reconcileHostedPayment(
        phonepePayment._id.toString(),
        phonepePayment.downloadToken,
      );
      assert.equal(
        (await NgoRecordModel.findById(phonepeSource.id))!.data._paymentStatus,
        "paid",
      );
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.TEST_PHONEPE_CLIENT_ID;
      delete process.env.TEST_PHONEPE_CLIENT_SECRET;
      delete process.env.TEST_PHONEPE_CLIENT_VERSION;
    }
    checks.push(
      "PhonePe reconciles an authenticated server-confirmed captured amount",
    );
    const retrySource = await saveRecord(
      "members",
      {
        status: "pending",
        data: {
          ...memberData,
          accountUserId: "qa-retry",
          email: "retry@example.invalid",
        },
      },
      admin,
    );
    const retryPayment = await NgoRecordModel.create({
      ...(await import("../src/lib/server/ngo/records")).recordInput(
        "gateway-payments",
        {
          source: retrySource.id,
          sourceModule: "members",
          provider: "phonepe",
          environment: "sandbox",
          amountMinor: 50000,
          redirectUrl: "https://mercury.phonepe.com/expired",
          checkoutExpiry: 1,
        },
        "pending",
        "qa",
        "qa-retry",
      ),
      identityKey: `checkout:${retrySource.id}`,
    });
    process.env.TEST_PHONEPE_CLIENT_ID = "qa-client";
    process.env.TEST_PHONEPE_CLIENT_SECRET = "qa-secret";
    process.env.TEST_PHONEPE_CLIENT_VERSION = "1";
    const runtimeEnv = (await import("../src/lib/server/env")).getServerEnv();
    runtimeEnv.DONATIONS_ENABLED = true;
    let retryState = "PENDING",
      payRequests = 0;
    globalThis.fetch = vi.fn(async (url) => {
      const path = String(url);
      if (path.endsWith("/pay")) payRequests++;
      return new Response(
        JSON.stringify(
          path.includes("oauth/token")
            ? { access_token: "qa-token" }
            : path.endsWith("/pay")
              ? { redirectUrl: "https://mercury.phonepe.com/qa-new-checkout" }
              : { state: retryState, amount: 50000 },
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as typeof fetch;
    try {
      const { startHostedPayment } =
        await import("../src/lib/server/ngo/hosted-payments");
      const retryActor = { id: "qa-retry", admin: false };
      await assert.rejects(
        () =>
          startHostedPayment(
            retrySource.id,
            "members",
            retryActor,
            "phonepe",
            "sandbox",
          ),
        (e) =>
          e instanceof Error && "code" in e && e.code === "PAYMENT_RECONCILING",
      );
      assert.equal(payRequests, 0);
      retryState = "FAILED";
      const next = await startHostedPayment(
        retrySource.id,
        "members",
        retryActor,
        "phonepe",
        "sandbox",
      );
      assert.equal(
        next.redirectUrl,
        "https://mercury.phonepe.com/qa-new-checkout",
      );
      assert.equal(payRequests, 1);
      assert.equal(
        (await NgoRecordModel.findById(retryPayment._id))!.status,
        "failed",
      );
      assert.equal(
        await NgoRecordModel.countDocuments({
          module: "gateway-payments",
          "data.source": retrySource.id,
        }),
        2,
      );
      await startHostedPayment(
        retrySource.id,
        "members",
        retryActor,
        "phonepe",
        "sandbox",
      );
      assert.equal(payRequests, 1);
    } finally {
      runtimeEnv.DONATIONS_ENABLED = false;
      globalThis.fetch = originalFetch;
      delete process.env.TEST_PHONEPE_CLIENT_ID;
      delete process.env.TEST_PHONEPE_CLIENT_SECRET;
      delete process.env.TEST_PHONEPE_CLIENT_VERSION;
    }
    checks.push(
      "expired hosted checkout waits for final failure, preserves history and reuses a safe retry",
    );
    const { GridFSBucket } = await import("mongodb");
    const bucket = new GridFSBucket(mongoose.connection.db!, {
      bucketName: "ngoUploads",
    });
    const upload = bucket.openUploadStream("qa-approval-evidence.pdf", {
      metadata: {
        ownerId: admin.id,
        contentType: "application/pdf",
        publicImage: false,
      },
    });
    await new Promise<void>((resolve, reject) => {
      upload.on("finish", resolve);
      upload.on("error", reject);
      upload.end(pdfReport);
    });
    await saveRecord(
      "tax-approvals",
      {
        status: "active",
        data: {
          name: "QA ONLY approval",
          pan: "ABCDE1234F",
          approvalNumber: "QA-ONLY-APPROVAL",
          startDate: "2026-01-01",
          endDate: "2027-12-31",
          proof: `/api/ngo/files/${upload.id}`,
          verified: true,
        },
      },
      admin,
    );
    const taxGift = await saveRecord(
      "offline-donations",
      { status: "confirmed", data: { ...giftData, amount: 100 } },
      admin,
    );
    const taxReceipt = await NgoRecordModel.findOne({
      module: "documents",
      "data.source": taxGift.id,
    });
    assert.equal(taxReceipt!.data._taxApproval, "QA-ONLY-APPROVAL");
    const cashGift = await saveRecord(
      "offline-donations",
      { status: "confirmed", data: { ...giftData, amount: 2001 } },
      admin,
    );
    const cashReceipt = await NgoRecordModel.findOne({
      module: "documents",
      "data.source": cashGift.id,
    });
    assert.equal(cashReceipt!.data._taxApproval, undefined);
    checks.push(
      "80G acknowledgement snapshots require real configured evidence and enforce cash restrictions",
    );
    const restoreDatabaseName = `ngo_restore_qa_${randomBytes(6).toString("hex")}`;
    const backupPath = `scratch/ngo-pdf-qa/${database}.ngobackup`;
    const backupKey = randomBytes(32).toString("hex");
    const { execFile } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const run = promisify(execFile);
    const testEnv = { ...process.env, BACKUP_ENCRYPTION_KEY: backupKey };
    const beforeBackup = await NgoRecordModel.countDocuments({});
    try {
      await run(
        process.execPath,
        ["scripts/ngo-backup.mjs", "backup", backupPath],
        { env: testEnv },
      );
      await run(
        process.execPath,
        ["scripts/ngo-backup.mjs", "restore", backupPath, restoreDatabaseName],
        { env: testEnv },
      );
      const restored = mongoose.connection.getClient().db(restoreDatabaseName);
      assert.equal(
        await restored.collection("ngorecords").countDocuments({}),
        beforeBackup,
      );
      const restoredMember = await restored
        .collection("ngorecords")
        .findOne({ reference: member.reference });
      assert(restoredMember?.createdAt instanceof Date);
      assert.equal(
        await restored
          .collection("ngoUploads.files")
          .countDocuments({ _id: upload.id }),
        1,
      );
      assert.equal(
        await restored
          .collection("ngoUploads.chunks")
          .countDocuments({ files_id: upload.id }),
        1,
      );
      assert.equal(
        (await restored.collection("ngorecords").indexes()).some(
          (index) => index.unique && index.key.reference,
        ),
        true,
      );
    } finally {
      if (restoreDatabaseName.startsWith("ngo_restore_qa_"))
        await mongoose.connection
          .getClient()
          .db(restoreDatabaseName)
          .dropDatabase();
    }
    checks.push(
      "encrypted full backup restores records, BSON dates and unique indexes into an isolated database",
    );
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
