import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import { ApiError } from "@/lib/server/errors";
import { errorResponse, getRequestId } from "@/lib/server/http";
import { findDonation } from "@/lib/server/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanAscii(str: string): string {
  return str
    .replace(/₹/g, "INR ")
    .replace(/·/g, "-")
    .replace(/—/g, "-")
    .replace(/[^\x20-\x7E]/g, " ");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    const { id } = await params;
    if (!/^(?:[a-f0-9]{24}|demo_[a-f0-9]{20})$/i.test(id)) {
      throw new ApiError(
        400,
        "INVALID_DONATION_ID",
        "Donation reference is invalid.",
      );
    }

    const result = await findDonation(id);
    if (!result) {
      throw new ApiError(
        404,
        "DONATION_NOT_FOUND",
        "Donation record not found.",
      );
    }

    const donation = result.record;
    if (donation.status !== "paid") {
      throw new ApiError(
        400,
        "RECEIPT_NOT_READY",
        "Receipt is only available for confirmed (paid) donations.",
      );
    }

    // Generate PDF Receipt
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const forestDark = rgb(0.06, 0.2, 0.17); // #0F322B
    const forestLight = rgb(0.92, 0.96, 0.94);
    const inkDark = rgb(0.08, 0.12, 0.11);
    const inkMuted = rgb(0.35, 0.4, 0.38);
    const white = rgb(1, 1, 1);
    const gold = rgb(0.78, 0.58, 0.2);
    const borderCol = rgb(0.82, 0.86, 0.84);

    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    // Outer decorative border
    page.drawRectangle({
      x: 24,
      y: 24,
      width: width - 48,
      height: height - 48,
      borderColor: forestDark,
      borderWidth: 2,
    });

    // Inner subtle border
    page.drawRectangle({
      x: 28,
      y: 28,
      width: width - 56,
      height: height - 56,
      borderColor: gold,
      borderWidth: 0.8,
    });

    // Top Header Banner
    page.drawRectangle({
      x: 28,
      y: height - 130,
      width: width - 56,
      height: 102,
      color: forestDark,
    });

    page.drawText("SKYMEREDIAN FOUNDATION", {
      x: 48,
      y: height - 68,
      size: 22,
      font: helveticaBold,
      color: white,
    });

    page.drawText("OFFICIAL 80G DONATION RECEIPT & TAX CERTIFICATE", {
      x: 48,
      y: height - 90,
      size: 10,
      font: helveticaBold,
      color: gold,
    });

    page.drawText(
      cleanAscii("Recognized Non-Profit Organization - Children's Welfare, Healthcare & Education"),
      {
        x: 48,
        y: height - 108,
        size: 8,
        font: helvetica,
        color: white,
      },
    );

    // Organization Legal Metadata
    let y = height - 160;
    page.drawText("REGISTRATION DETAILS & STATUTORY EXEMPTION", {
      x: 48,
      y,
      size: 9,
      font: helveticaBold,
      color: forestDark,
    });

    y -= 16;
    const orgDetails = [
      "Trust Registration: SKY/2026/80G/9941 - Income Tax PAN: AAATS1234F",
      "80G Exemption Approval Order: ITBA/EXM/80G/2025-26/SKY9941",
      "Registered Address: Sector 62, Institutional Area, Noida, UP 201301, India",
      "Contact: support@skymeredian.org - Website: https://skymeredian.org",
    ];

    for (const line of orgDetails) {
      page.drawText(cleanAscii(line), {
        x: 48,
        y,
        size: 8,
        font: helvetica,
        color: inkMuted,
      });
      y -= 13;
    }

    // Receipt Meta Box
    y -= 10;
    page.drawRectangle({
      x: 48,
      y: y - 55,
      width: width - 96,
      height: 55,
      color: forestLight,
      borderColor: borderCol,
      borderWidth: 1,
    });

    const receiptNo = `RCP-SKY-${donation.id.slice(-8).toUpperCase()}-${new Date(donation.createdAt).getFullYear()}`;
    const formattedDate = new Date(donation.createdAt).toUTCString();

    page.drawText(`Receipt No: ${receiptNo}`, {
      x: 60,
      y: y - 22,
      size: 10,
      font: helveticaBold,
      color: forestDark,
    });

    page.drawText(`Date & Time: ${formattedDate}`, {
      x: 60,
      y: y - 42,
      size: 8.5,
      font: helvetica,
      color: inkDark,
    });

    const statusText = `Status: CONFIRMED (${donation.status.toUpperCase()})`;
    page.drawText(statusText, {
      x: width - 240,
      y: y - 22,
      size: 9,
      font: helveticaBold,
      color: forestDark,
    });

    page.drawText(`Payment Mode: ${donation.provider.toUpperCase()}`, {
      x: width - 240,
      y: y - 42,
      size: 9,
      font: helvetica,
      color: inkDark,
    });

    // Donor & Contribution Particulars Table
    y -= 85;
    page.drawText("DONOR & DONATION PARTICULARS", {
      x: 48,
      y,
      size: 10,
      font: helveticaBold,
      color: forestDark,
    });

    y -= 18;
    const amountVal = (donation.amountMinor / 100).toFixed(2);
    const amountStr = `${donation.currency} ${amountVal}`;

    const tableRows = [
      ["Donor Full Name", donation.donor.name],
      ["Donor Email Address", donation.donor.email],
      ["Phone Number", donation.donor.phone || "Not provided"],
      ["Country / Location", donation.donor.country || "India"],
      ["Contribution Frequency", donation.frequency.replace("_", " ").toUpperCase()],
      ["Transaction Reference", donation.externalPaymentId || donation.id],
      ["Total Amount Received", amountStr],
    ];

    for (const [label, val] of tableRows) {
      page.drawRectangle({
        x: 48,
        y: y - 22,
        width: width - 96,
        height: 22,
        color: white,
        borderColor: borderCol,
        borderWidth: 0.5,
      });

      page.drawText(cleanAscii(label), {
        x: 60,
        y: y - 15,
        size: 9,
        font: helveticaBold,
        color: inkDark,
      });

      page.drawText(cleanAscii(val), {
        x: 230,
        y: y - 15,
        size: 9,
        font: helvetica,
        color: label.includes("Total Amount") ? forestDark : inkDark,
      });

      y -= 22;
    }

    // 80G Statutory Exemption Declaration
    y -= 25;
    page.drawRectangle({
      x: 48,
      y: y - 75,
      width: width - 96,
      height: 75,
      color: forestLight,
      borderColor: gold,
      borderWidth: 1,
    });

    page.drawText("SECTION 80G TAX EXEMPTION DECLARATION", {
      x: 60,
      y: y - 20,
      size: 9,
      font: helveticaBold,
      color: forestDark,
    });

    const certText1 =
      "This certifies that Skymeredian Foundation has received the charitable contribution specified above.";
    const certText2 =
      "This donation is eligible for 50% deduction under Section 80G of the Indian Income Tax Act, 1961.";
    const certText3 =
      "Donations are applied towards verified public charitable welfare, healthcare, and education.";
    const certText4 =
      "Please retain this verified certificate for income tax return filing.";

    page.drawText(cleanAscii(certText1), { x: 60, y: y - 34, size: 8, font: helvetica, color: inkDark });
    page.drawText(cleanAscii(certText2), { x: 60, y: y - 46, size: 8, font: helveticaBold, color: forestDark });
    page.drawText(cleanAscii(certText3), { x: 60, y: y - 58, size: 8, font: helvetica, color: inkMuted });
    page.drawText(cleanAscii(certText4), { x: 60, y: y - 70, size: 8, font: helvetica, color: inkMuted });

    // Signature and Seal Block
    y -= 140;
    page.drawText("For SKYMEREDIAN FOUNDATION", {
      x: width - 240,
      y: y + 30,
      size: 9,
      font: helveticaBold,
      color: forestDark,
    });

    page.drawLine({
      start: { x: width - 240, y: y + 8 },
      end: { x: width - 60, y: y + 8 },
      color: inkMuted,
      thickness: 1,
    });

    page.drawText("Authorized Signatory", {
      x: width - 240,
      y: y - 4,
      size: 8,
      font: helveticaBold,
      color: inkDark,
    });

    page.drawText("(Digitally verified computer-generated receipt)", {
      x: width - 240,
      y: y - 16,
      size: 7,
      font: helvetica,
      color: inkMuted,
    });

    // Footer
    page.drawText(
      cleanAscii("Skymeredian Foundation - Reg: SKY/2026/80G/9941 - www.skymeredian.org - All Rights Reserved"),
      {
        x: 48,
        y: 40,
        size: 7.5,
        font: helvetica,
        color: inkMuted,
      },
    );

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${receiptNo}.pdf"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    return errorResponse(error, requestId, "donation-receipt");
  }
}
