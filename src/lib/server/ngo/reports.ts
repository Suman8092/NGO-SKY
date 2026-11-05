import "server-only";
import { analyticsRows } from "./analytics";
import { projectAccounting } from "./project-accounting";
import "regenerator-runtime/runtime";

import { onlineFilter, onlineRecord } from "./online-records";

import ExcelJS from "exceljs";

import { PDFDocument, rgb } from "pdf-lib";

import fontkit from "@pdf-lib/fontkit";

import { readFile } from "node:fs/promises";

import { join } from "node:path";

import { getModule } from "@/lib/ngo/catalog";

import { NgoAuditModel, NgoRecordModel } from "@/models/NgoRecord";

import { DonationModel } from "@/models/Donation";

import { ApiError } from "../errors";

import { requireNgoDatabase, type NgoActor } from "./access";

import { listFilter } from "./records";

export async function reportRows(
  module: string,
  params: URLSearchParams,
  actor: NgoActor,
) {
  if (!actor.admin && (!actor.coordinator || !getModule(module)?.coordinator))
    throw new ApiError(403, "FORBIDDEN", "Reports access is restricted.");

  await requireNgoDatabase();
  const definition = getModule(module);

  if (!definition || module === "audit")
    throw new ApiError(404, "NOT_FOUND", "Choose a report module.");

  if (["member-referrals", "campaign-analytics"].includes(module)) {
    const result = await analyticsRows(module, params, true);
    return {
      headers: [
        "Reference",
        "Status",
        ...definition.fields.map((f) => f.label),
      ],
      rows: result.rows.map((r) => [
        r.reference,
        r.status,
        ...definition.fields.map(
          (f) =>
            (r.data as Record<string, string | number | boolean>)[f.key] ?? "",
        ),
      ]),
      definition,
    };
  }
  if (module === "online-donations") {
    const filter = await onlineFilter(params);
    const count = await DonationModel.countDocuments(filter);
    if (count > 10000)
      throw new ApiError(
        422,
        "REPORT_TOO_LARGE",
        "Narrow the date range to export at most 10,000 records.",
      );
    const docs = await DonationModel.find(filter).sort({ createdAt: -1 });
    return {
      headers: [
        "Reference",
        "Status",
        "Created (UTC)",
        ...definition.fields.map((f) => f.label),
      ],
      rows: docs.map((d) => {
        const r = onlineRecord(d);
        return [
          r.reference,
          r.status,
          r.createdAt,
          ...definition.fields.map((f) => r.data[f.key] ?? ""),
        ];
      }),
      definition,
    };
  }

  const filter = listFilter(module, params, actor);
  const count = await NgoRecordModel.countDocuments(filter);

  if (count > 10000)
    throw new ApiError(
      422,
      "REPORT_TOO_LARGE",
      "Narrow the date range to export at most 10,000 records.",
    );

  const docs = await NgoRecordModel.find(filter).sort({ createdAt: -1 }).lean();

  const headers = [
    "Reference",
    "Status",
    "Created (UTC)",
    ...definition.fields.map((f) => f.label),
  ];

  const rows = docs.map((d) => [
    d.reference,
    d.status,
    d.createdAt.toISOString(),
    ...definition.fields.map((f) => d.data[f.key] ?? ""),
  ]);

  await NgoAuditModel.create({
    actor: actor.id,
    action: "export",
    module,
    recordId: "report",
    reference: `${module}:${docs.length}`,
    fields: params.toString() ? [params.toString().slice(0, 400)] : [],
  });

  return { headers, rows, definition };
}

export async function exportWorkbook(
  headers: string[],
  rows: unknown[][],
  title: string,
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Skymeredian Foundation";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(
    title.replace(/[\\/?*:[\]]/g, " ").slice(0, 31),
  );
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF004F97" },
  };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  for (const row of rows)
    sheet.addRow(
      row.map((v) =>
        typeof v === "number"
          ? v
          : typeof v === "boolean"
            ? v
            : String(v ?? ""),
      ),
    );

  sheet.columns.forEach((col, i) => {
    col.width = i === 0 ? 32 : 24;
  });
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(1, rows.length + 1), column: headers.length },
  };

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

export async function exportReportPdf(
  headers: string[],
  rows: unknown[][],
  title: string,
) {
  if (rows.length > 1000)
    throw new ApiError(
      422,
      "PDF_TOO_LARGE",
      "Use a narrower date range for PDF reports (maximum 1,000 records), or export all matching rows to Excel.",
    );

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(
    new Uint8Array(
      await readFile(
        join(process.cwd(), "src/assets/fonts/NotoSansDevanagari.ttf"),
      ),
    ),
    { subset: true },
  );
  let page = pdf.addPage([595, 842]),
    y = 780;

  const heading = () => {
    page.drawText(title, {
      x: 36,
      y: 800,
      size: 14,
      font,
      color: rgb(0, 0.25, 0.48),
    });
    page.drawText(
      `Exported ${new Date().toISOString()} · ${rows.length} records`,
      { x: 36, y: 782, size: 7, font },
    );
    y = 755;
  };
  heading();

  const draw = (text: string, size = 9) => {
    for (const paragraph of text.split(/\n/)) {
      let line = "";
      for (const char of paragraph) {
        if (font.widthOfTextAtSize(line + char, size) > 523) {
          if (y < 45) {
            page = pdf.addPage([595, 842]);
            heading();
          }
          page.drawText(line, { x: 36, y, size, font });
          y -= size * 1.5;
          line = char;
        } else line += char;
      }
      if (y < 45) {
        page = pdf.addPage([595, 842]);
        heading();
      }
      page.drawText(line, { x: 36, y, size, font });
      y -= size * 1.5;
    }
  };

  for (const row of rows) {
    if (y < 140) {
      page = pdf.addPage([595, 842]);
      heading();
    }
    draw(String(row[0]), 11);
    for (let i = 1; i < headers.length; i++)
      if (row[i] !== "" && row[i] !== undefined)
        draw(`${headers[i]}: ${String(row[i])}`);
    y -= 14;
  }

  if (!rows.length) draw("No records match these filters.", 11);
  return Buffer.from(await pdf.save());
}

export async function financialSummary() {
  await requireNgoDatabase();
  const all = await NgoRecordModel.find({
    module: {
      $in: [
        "offline-donations",
        "membership-payments",
        "project-funds",
        "expenses",
        "in-kind",
        "members",
        "coordinators",
        "beneficiaries",
        "complaints",
        "projects",
      ],
    },
    deletedAt: null,
    "data._provisional": { $ne: true },
  }).lean();

  const money = (module: string, status: string, field = "amount") =>
    all
      .filter((d) => d.module === module && d.status === status)
      .reduce((n, d) => n + Math.round(Number(d.data[field] ?? 0) * 100), 0);

  const online = await DonationModel.aggregate([
    { $match: { status: "paid", currency: "INR" } },
    {
      $group: {
        _id: null,
        total: {
          $sum: {
            $subtract: [
              "$amountMinor",
              { $ifNull: ["$refundedAmountMinor", 0] },
            ],
          },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const onlinePeriods = await DonationModel.aggregate([
    { $match: { status: "paid", currency: "INR" } },

    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m",
            date: "$createdAt",
            timezone: "Asia/Kolkata",
          },
        },
        total: {
          $sum: {
            $subtract: [
              "$amountMinor",
              { $ifNull: ["$refundedAmountMinor", 0] },
            ],
          },
        },
      },
    },
  ]);

  const income =
    money("offline-donations", "confirmed") +
    money("membership-payments", "confirmed") +
    money("project-funds", "confirmed") +
    Number(online[0]?.total ?? 0);
  const expenses = money("expenses", "approved");

  const periods: Record<string, { income: number; expenses: number }> = {};
  const coordinators: Record<
    string,
    { donations: number; donors: number; gifts: number; members: number }
  > = {};
  const projects: Record<string, { income: number; expenses: number }> = {};
  const coordinatorDonors = new Map<string, Set<string>>();

  for (const d of all) {
    const key = String(
      d.data.date ?? d.createdAt.toISOString().slice(0, 10),
    ).slice(0, 7);
    periods[key] ??= { income: 0, expenses: 0 };
    const amount = Math.round(Number(d.data.amount ?? 0) * 100);
    const isIncome =
      ["offline-donations", "membership-payments", "project-funds"].includes(
        d.module,
      ) && d.status === "confirmed";
    const isExpense = d.module === "expenses" && d.status === "approved";
    if (isIncome) periods[key].income += amount;
    if (isExpense) periods[key].expenses += amount;

    if (d.data.project) {
      const k = String(d.data.project);
      projects[k] ??= { income: 0, expenses: 0 };
      if (isIncome) projects[k].income += amount;
      if (isExpense) projects[k].expenses += amount;
    }

    if (d.data.coordinator) {
      const k = String(d.data.coordinator);
      coordinators[k] ??= { donations: 0, donors: 0, gifts: 0, members: 0 };
      if (d.module === "offline-donations" && d.status === "confirmed") {
        coordinators[k].donations += amount;
        coordinators[k].gifts++;
        const donors = coordinatorDonors.get(k) ?? new Set<string>();
        donors.add(
          String(d.data.email || d.data.phone || d._id)
            .trim()
            .toLowerCase(),
        );
        coordinatorDonors.set(k, donors);
        coordinators[k].donors = donors.size;
      }
      if (d.module === "members") coordinators[k].members++;
    }
  }

  for (const row of onlinePeriods) {
    const key = String(row._id);
    periods[key] ??= { income: 0, expenses: 0 };
    periods[key].income += Number(row.total);
  }

  const projectTotals = await projectAccounting(
    all.filter((d) => d.module === "projects").map((d) => d._id.toString()),
  );
  for (const [id, total] of Object.entries(projectTotals)) {
    projects[id] = { income: total.incomeMinor, expenses: total.expenseMinor };
  }

  const labels = Object.fromEntries(
    all
      .filter((d) => ["projects", "coordinators"].includes(d.module))
      .map((d) => [d._id.toString(), `${d.data.name} (${d.reference})`]),
  );

  return {
    labels,
    incomeMinor: income,
    expenseMinor: expenses,
    balanceMinor: income - expenses,
    onlineDonationMinor: Number(online[0]?.total ?? 0),
    inKindEstimatedMinor:
      money("in-kind", "received", "estimatedValue") +
      money("in-kind", "distributed", "estimatedValue"),
    members: all.filter((d) => d.module === "members").length,
    approvedMembers: all.filter(
      (d) => d.module === "members" && d.status === "approved",
    ).length,
    beneficiaries: all.filter((d) => d.module === "beneficiaries").length,
    openComplaints: all.filter(
      (d) => d.module === "complaints" && d.status !== "resolved",
    ).length,
    periods,
    coordinators,
    projects,
  };
}
