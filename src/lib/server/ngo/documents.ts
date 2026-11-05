import "server-only";
import "regenerator-runtime/runtime";

import { readFile } from "node:fs/promises";

import { join } from "node:path";

import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";

import fontkit from "@pdf-lib/fontkit";

import QRCode from "qrcode";

import { GridFSBucket, ObjectId } from "mongodb";

import { DonationModel } from "@/models/Donation";

import { requireNgoDatabase } from "./access";

import { brand } from "@/content/site";

import { getVerifiedSiteOrigin } from "../env";

import { ApiError } from "../errors";

import { NgoRecordModel, type NgoDocument } from "@/models/NgoRecord";

export function verificationUrl(doc: NgoDocument) {
  const origin = getVerifiedSiteOrigin();
  if (!origin)
    throw new ApiError(
      503,
      "SITE_ORIGIN_REQUIRED",
      "Configure the public HTTPS website origin before issuing documents.",
    );
  return `${origin}/verify/${doc.verifyToken}`;
}

export async function documentValidity(doc: NgoDocument) {
  if (
    doc.data._provisional === true ||
    doc.deletedAt ||
    ["revoked", "void", "blocked", "expired", "draft"].includes(doc.status)
  )
    return false;

  if (
    doc.data.expiry &&
    String(doc.data.expiry) < new Date().toISOString().slice(0, 10)
  )
    return false;

  if (doc.data.source && doc.data.sourceModule === "online-donations") {
    const donation = await DonationModel.findById(String(doc.data.source))
      .select("status")
      .lean();
    if (!donation || donation.status !== "paid") return false;
  }

  if (doc.data.source && doc.data.sourceModule !== "online-donations") {
    const source = await NgoRecordModel.findById(String(doc.data.source))
      .select("status deletedAt data._expires")
      .lean();
    if (
      !source ||
      source.deletedAt ||
      ["void", "cancelled", "blocked", "expired", "rejected"].includes(
        source.status,
      ) ||
      (source.data._expires &&
        String(source.data._expires) < new Date().toISOString().slice(0, 10))
    )
      return false;
  }

  if (doc.data.source && doc.data.sourceModule === "members") {
    const member = await NgoRecordModel.findById(String(doc.data.source))
      .select("status deletedAt")
      .lean();
    if (!member || member.deletedAt || member.status !== "approved")
      return false;
  }

  if (doc.data.member) {
    const member = await NgoRecordModel.findById(String(doc.data.member))
      .select("status deletedAt")
      .lean();
    if (!member || member.deletedAt || member.status !== "approved")
      return false;
  }

  return ["issued", "confirmed"].includes(doc.status);
}

const palettes: Record<string, [number, number, number]> = {
  classic: [0, 0.25, 0.48],
  modern: [0, 0.39, 0.58],
  heritage: [0.4, 0.24, 0.08],
  minimal: [0.12, 0.17, 0.24],
  honour: [0.16, 0.39, 0.15],
  executive: [0.29, 0.2, 0.43],
};

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];

  for (const paragraph of text.replace(/\r/g, "").split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      if (font.widthOfTextAtSize(word, size) > width) {
        if (line) {
          lines.push(line);
          line = "";
        }
        let part = "";
        for (const char of word) {
          if (font.widthOfTextAtSize(part + char, size) > width) {
            lines.push(part);
            part = char;
          } else part += char;
        }
        line = part;
      } else if (
        font.widthOfTextAtSize(line ? `${line} ${word}` : word, size) > width
      ) {
        lines.push(line);
        line = word;
      } else line = line ? `${line} ${word}` : word;
    }

    lines.push(line);
  }

  return lines;
}

let fontBytes: Promise<Buffer> | undefined;

export async function renderNgoDocument(doc: NgoDocument) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  fontBytes ??= readFile(
    join(process.cwd(), "src/assets/fonts/NotoSansDevanagari.ttf"),
  );

  const font = await pdf.embedFont(new Uint8Array(await fontBytes), {
    subset: true,
  });

  const logo = await pdf.embedPng(
    new Uint8Array(
      await readFile(
        join(process.cwd(), "public/brand/foundation-logo-transparent.png"),
      ),
    ),
  );

  const qr = await pdf.embedPng(
    new Uint8Array(
      await QRCode.toBuffer(verificationUrl(doc), {
        width: 240,
        margin: 2,
        errorCorrectionLevel: "M",
      }),
    ),
  );

  const card = doc.data.type === "id-card";

  const certificate =
    (doc.module === "certificates" &&
      !["id-card", "appointment"].includes(String(doc.data.type))) ||
    String(doc.data.type).includes("certificate");

  const [w, h] = card ? [342, 216] : certificate ? [842, 595] : [595, 842];

  const accent = rgb(
    ...(palettes[String(doc.data.template)] ?? palettes.classic),
  );
  const ink = rgb(0.07, 0.12, 0.2);

  const margin = card ? 20 : 48;

  const organization = await NgoRecordModel.findOne({
    module: "organization",
    status: "active",
    deletedAt: null,
  }).lean();

  const issuerName = String(
    doc.data._issuerName !== undefined
      ? doc.data._issuerName || brand.legalName
      : organization?.data.name || brand.legalName,
  );

  const issuerContact = [
    doc.data._issuerAddress ?? organization?.data.address,
    doc.data._issuerEmail ?? organization?.data.email,
    doc.data._issuerPhone ?? organization?.data.phone,
  ]
    .filter(Boolean)
    .join(" · ");

  let page: PDFPage;
  let y = 0;

  const newPage = () => {
    page = pdf.addPage([w, h]);

    const template = String(doc.data.template ?? "classic");

    if (!card && template === "classic") {
      page.drawRectangle({
        x: 20,
        y: 20,
        width: w - 40,
        height: h - 40,
        borderWidth: 1,
        borderColor: accent,
      });
      page.drawRectangle({
        x: 26,
        y: 26,
        width: w - 52,
        height: h - 52,
        borderWidth: 0.4,
        borderColor: accent,
      });
    }

    if (!card && template === "modern")
      page.drawRectangle({ x: 0, y: 0, width: 14, height: h, color: accent });

    if (!card && template === "heritage")
      for (const [x, y] of [
        [22, 22],
        [w - 58, 22],
        [22, h - 58],
        [w - 58, h - 58],
      ]) {
        page.drawRectangle({
          x,
          y,
          width: 36,
          height: 36,
          borderColor: accent,
          borderWidth: 2,
        });
      }

    if (!card && template === "minimal")
      page.drawLine({
        start: { x: margin, y: h - 112 },
        end: { x: w - margin, y: h - 112 },
        color: accent,
        thickness: 1,
      });

    if (!card && template === "honour") {
      page.drawRectangle({
        x: 0,
        y: h - 20,
        width: w,
        height: 20,
        color: accent,
      });
      page.drawRectangle({ x: 0, y: 0, width: w, height: 12, color: accent });
    }

    if (!card && template === "executive") {
      page.drawRectangle({ x: 0, y: 0, width: 20, height: h, color: accent });
      page.drawLine({
        start: { x: 34, y: 34 },
        end: { x: 34, y: h - 34 },
        color: accent,
        thickness: 1,
      });
    }

    page.drawRectangle({
      x: 0,
      y: h - (card ? 5 : 8),
      width: w,
      height: card ? 5 : 8,
      color: accent,
    });
    page.drawImage(logo, {
      x: margin,
      y: h - (card ? 58 : 100),
      width: card ? 120 : 200,
      height: card ? 40 : 67,
    });

    page.drawText(doc.reference, {
      x: margin,
      y: 24,
      size: card ? 6 : 8,
      font,
      color: ink,
    });
    page.drawText(`${pdf.getPageCount()}`, {
      x: w - margin - 10,
      y: 24,
      size: 8,
      font,
      color: ink,
    });
    y = h - (card ? 78 : 132);
  };

  newPage();

  const text = (
    value: string,
    size = 11,
    color = ink,
    width = w - margin * 2,
  ) => {
    for (const line of wrap(value, font, size, width)) {
      if (y < (card ? 30 : 150)) newPage();
      page.drawText(line, { x: margin, y, size, font, color });
      y -= size * 1.6;
    }
  };

  const valid = await documentValidity(doc);

  if (!valid) {
    text(
      doc.status === "draft"
        ? "DRAFT - NOT ISSUED"
        : "REVOKED / NO LONGER VALID",
      card ? 9 : 16,
      rgb(0.7, 0.12, 0.12),
    );
    y -= 8;
  }

  if (
    card &&
    typeof doc.data.photo === "string" &&
    /^\/api\/ngo\/files\/[a-f0-9]{24}$/.test(doc.data.photo)
  ) {
    const db = (await requireNgoDatabase()).connection.db!;
    const bucket = new GridFSBucket(db, { bucketName: "ngoUploads" });
    const parts: Buffer[] = [];
    for await (const chunk of bucket.openDownloadStream(
      new ObjectId(doc.data.photo.split("/").pop()!),
    ))
      parts.push(Buffer.from(chunk));
    const bytes = Buffer.concat(parts);
    const photo =
      bytes[0] === 137
        ? await pdf.embedPng(new Uint8Array(bytes))
        : await pdf.embedJpg(new Uint8Array(bytes));
    page!.drawImage(photo, { x: w - 72, y: h - 65, width: 48, height: 48 });
  }

  if (card) {
    text("MEMBERSHIP IDENTITY CARD", 9, accent, 210);
    text(String(doc.data.name), 13, ink, 215);
    text(String(doc.data.date), 8, ink, 210);
    if (doc.data.expiry) text(`Valid until ${doc.data.expiry}`, 7, ink, 210);
    text("Verify current membership by scanning this code.", 7, ink, 205);
    page!.drawImage(qr, { x: w - 95, y: 65, width: 70, height: 70 });
  } else {
    const title = String(
      doc.data.title ?? doc.data.type ?? "Official document",
    ).replaceAll("-", " ");
    text(title.toUpperCase(), certificate ? 25 : 20, accent);
    y -= certificate ? 14 : 8;

    text(certificate ? "Presented to" : "Recipient", 10);
    y -= certificate ? 12 : 4;
    text(String(doc.data.name ?? ""), certificate ? 23 : 15, ink);
    y -= 10;

    if (doc.data.type === "item-receipt") {
      text(
        `Item: ${doc.data.item ?? ""} · ${doc.data.quantity ?? 0} ${doc.data.unit ?? ""}`,
        13,
        accent,
      );
      text(
        `Estimated value: INR ${Number(doc.data.estimatedValue ?? 0).toFixed(2)} (not a cash contribution)`,
        10,
      );
    }

    const amount = Number(doc.data.amount ?? 0);
    if (
      doc.data.type !== "item-receipt" &&
      (String(doc.data.type).includes("receipt") ||
        doc.module === "custom-receipts")
    ) {
      text(`Amount received: INR ${amount.toFixed(2)}`, 14, accent);
      text(`Payment method: ${doc.data.method || "Recorded in register"}`);
      if (doc.data.transaction)
        text(`Transaction reference: ${doc.data.transaction}`);
      y -= 8;
    }

    if (doc.data._taxApproval) {
      text(
        `Organization approval under section 80G: ${doc.data._taxApproval}`,
        9,
      );
      text(
        `Organization PAN: ${doc.data._taxPan} · Approval valid until ${doc.data._taxValidUntil}`,
        9,
      );
      text(
        "Donation acknowledgement only. Form 10BE, where applicable, is issued separately after statutory reporting.",
        8,
      );
      y -= 8;
    }
    text(
      String(doc.data.content ?? doc.data.purpose ?? ""),
      certificate ? 13 : 11,
    );
    y -= 14;

    text(
      `Issued: ${doc.data.date ?? doc.createdAt.toISOString().slice(0, 10)}`,
      9,
    );
    if (doc.data.expiry) text(`Valid until: ${doc.data.expiry}`, 9);
    text(String(doc.data.signatory ?? ""), 10, accent);

    const last = pdf.getPages()[pdf.getPageCount() - 1];
    last.drawImage(qr, { x: w - margin - 82, y: 40, width: 82, height: 82 });
    last.drawText("Scan to verify current status", {
      x: w - margin - 115,
      y: 30,
      size: 7,
      font,
      color: ink,
    });

    last.drawText(issuerName, {
      x: margin,
      y: 64,
      size: 9,
      font,
      color: accent,
    });
    let contact = issuerContact;
    while (
      font.widthOfTextAtSize(contact, 6) > w - margin * 2 - 100 &&
      contact.length > 1
    )
      contact = contact.slice(0, -1);
    last.drawText(contact, { x: margin, y: 51, size: 6, font, color: ink });

    last.drawText(
      "Electronically issued. No statutory tax exemption is implied.",
      { x: margin, y: 40, size: 6, font, color: ink },
    );
  }

  pdf.setTitle(
    `${doc.reference} - ${String(doc.data.title ?? "Foundation document")}`,
  );
  pdf.setAuthor(brand.legalName);

  if (doc.data._provisional === true || doc.status === "draft")
    for (const sheet of pdf.getPages())
      sheet.drawText("PROVISIONAL / TEST - NOT AN OFFICIAL DOCUMENT", {
        x: 12,
        y: 12,
        size: 7,
        font,
        color: rgb(0.7, 0.12, 0.1),
      });
  return Buffer.from(await pdf.save());
}
