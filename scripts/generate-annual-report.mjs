import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

async function createAnnualReport() {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const forestDark = rgb(0.06, 0.20, 0.17); // #0F322B
  const forestMedium = rgb(0.12, 0.38, 0.32);
  const forestLight = rgb(0.88, 0.94, 0.92);
  const inkDark = rgb(0.08, 0.12, 0.11);
  const inkMuted = rgb(0.35, 0.40, 0.38);
  const white = rgb(1, 1, 1);
  const gold = rgb(0.78, 0.58, 0.20);
  const dividerColor = rgb(0.85, 0.88, 0.86);

  // ================= PAGE 1: COVER & EXECUTIVE SUMMARY =================
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page1.getSize();

  // Top header background banner
  page1.drawRectangle({
    x: 0,
    y: height - 140,
    width: width,
    height: 140,
    color: forestDark,
  });

  // Top accent bar
  page1.drawRectangle({
    x: 0,
    y: height - 6,
    width: width,
    height: 6,
    color: gold,
  });

  // Brand Name & Subtitle on Banner
  page1.drawText("SKYMEREDIAN FOUNDATION", {
    x: 45,
    y: height - 60,
    size: 24,
    font: helveticaBold,
    color: white,
  });

  page1.drawText("ANNUAL & IMPACT TRANSPARENCY REPORT · 2025–2026", {
    x: 45,
    y: height - 85,
    size: 11,
    font: helveticaBold,
    color: gold,
  });

  page1.drawText("Verified Public Governance & Audited Financial Disclosure", {
    x: 45,
    y: height - 105,
    size: 9,
    font: helvetica,
    color: forestLight,
  });

  // Institutional metadata box
  page1.drawRectangle({
    x: 45,
    y: height - 205,
    width: width - 90,
    height: 50,
    color: forestLight,
    borderColor: forestMedium,
    borderWidth: 1,
  });

  page1.drawText("STATUTORY REGISTRATION & ACCREDITATIONS", {
    x: 55,
    y: height - 170,
    size: 8,
    font: helveticaBold,
    color: forestDark,
  });

  const regInfo = "NGO Darpan ID: KA/2020/0264812  |  Section 80G & 12A Certified  |  HQ: Bengaluru, Karnataka, India";
  page1.drawText(regInfo, {
    x: 55,
    y: height - 190,
    size: 9,
    font: helvetica,
    color: inkDark,
  });

  // Section 1: Executive Mission & Founder's Statement
  page1.drawText("1. EXECUTIVE SUMMARY & MISSION PHILOSOPHY", {
    x: 45,
    y: height - 240,
    size: 13,
    font: helveticaBold,
    color: forestDark,
  });

  page1.drawLine({
    start: { x: 45, y: height - 246 },
    end: { x: width - 45, y: height - 246 },
    thickness: 1.5,
    color: forestMedium,
  });

  const statementP1 =
    "Skymeredian Foundation was established with a singular, unbending commitment: community-owned progress. " +
    "Rather than treating communities as passive recipients of aid, our programs invest in locally-led leadership, " +
    "flexible capital, and verified institutional transparency. In FY 2025-26, our operations expanded across " +
    "primary education, preventive healthcare, regenerative rural livelihoods, and clean community infrastructure.";

  const statementP2 =
    "\"Dignity is not an extra layer of the work. It is the way the work must be done.\" This guiding principle " +
    "directs every grant, volunteer deployment, and statutory rupee deployed across our field centers.";

  page1.drawText(statementP1, {
    x: 45,
    y: height - 275,
    size: 9.5,
    font: helvetica,
    color: inkDark,
    lineHeight: 14,
    maxWidth: width - 90,
  });

  page1.drawText(statementP2, {
    x: 45,
    y: height - 340,
    size: 10,
    font: helveticaOblique,
    color: forestMedium,
    lineHeight: 14,
    maxWidth: width - 90,
  });

  // Section 2: Key Operational Metrics Cards
  page1.drawText("2. KEY PERFORMANCE INDICATORS (FY 2025-26)", {
    x: 45,
    y: height - 390,
    size: 13,
    font: helveticaBold,
    color: forestDark,
  });

  page1.drawLine({
    start: { x: 45, y: height - 396 },
    end: { x: width - 45, y: height - 396 },
    thickness: 1.5,
    color: forestMedium,
  });

  const metrics = [
    { value: "124,000+", label: "Lives Positively Impacted", detail: "Across 6 targeted rural clusters" },
    { value: "148", label: "Learning Pods Active", detail: "Equipped with trained local teachers" },
    { value: "42", label: "Health & Care Camps", detail: "Preventive screenings & maternal care" },
    { value: "87", label: "Clean Water Stations", detail: "Solar-powered community hubs" },
    { value: "94.2%", label: "Direct Field Program Ratio", detail: "Exceeding regulatory standards" },
    { value: "100%", label: "Audited 80G Receipts", detail: "Instant tax reconciliation" },
  ];

  const cardW = (width - 90 - 20) / 3;
  const cardH = 65;

  metrics.forEach((m, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const cx = 45 + col * (cardW + 10);
    const cy = height - 425 - row * (cardH + 12);

    page1.drawRectangle({
      x: cx,
      y: cy - cardH,
      width: cardW,
      height: cardH,
      color: forestLight,
      borderColor: dividerColor,
      borderWidth: 1,
    });

    page1.drawText(m.value, {
      x: cx + 12,
      y: cy - 24,
      size: 14,
      font: helveticaBold,
      color: forestDark,
    });

    page1.drawText(m.label, {
      x: cx + 12,
      y: cy - 40,
      size: 8.5,
      font: helveticaBold,
      color: inkDark,
    });

    page1.drawText(m.detail, {
      x: cx + 12,
      y: cy - 54,
      size: 7.5,
      font: helvetica,
      color: inkMuted,
    });
  });

  // Section 3: Financial Summary Table
  const tableY = height - 600;
  page1.drawText("3. AUDITED FINANCIAL OVERVIEW (IN INR LAKHS)", {
    x: 45,
    y: tableY,
    size: 13,
    font: helveticaBold,
    color: forestDark,
  });

  page1.drawLine({
    start: { x: 45, y: tableY - 6 },
    end: { x: width - 45, y: tableY - 6 },
    thickness: 1.5,
    color: forestMedium,
  });

  // Financial Table Header
  const rowY = tableY - 30;
  page1.drawRectangle({
    x: 45,
    y: rowY - 5,
    width: width - 90,
    height: 22,
    color: forestMedium,
  });

  page1.drawText("EXPENDITURE CATEGORY", { x: 55, y: rowY + 3, size: 8, font: helveticaBold, color: white });
  page1.drawText("FY 2024-25", { x: 280, y: rowY + 3, size: 8, font: helveticaBold, color: white });
  page1.drawText("FY 2025-26", { x: 380, y: rowY + 3, size: 8, font: helveticaBold, color: white });
  page1.drawText("ALLOCATION", { x: 480, y: rowY + 3, size: 8, font: helveticaBold, color: white });

  const finRows = [
    ["Direct Community & Education Programs", "482.50", "840.00", "84.0%"],
    ["Accountability, Audits & Safeguarding", "58.20", "100.00", "10.0%"],
    ["Digital Systems, Outreach & Fundraising", "34.30", "60.00", "6.0%"],
  ];

  finRows.forEach((r, i) => {
    const curY = rowY - 26 - i * 20;
    page1.drawRectangle({
      x: 45,
      y: curY - 5,
      width: width - 90,
      height: 20,
      color: i % 2 === 0 ? white : forestLight,
    });
    page1.drawText(r[0], { x: 55, y: curY + 2, size: 8.5, font: helvetica, color: inkDark });
    page1.drawText(r[1], { x: 280, y: curY + 2, size: 8.5, font: helvetica, color: inkDark });
    page1.drawText(r[2], { x: 380, y: curY + 2, size: 8.5, font: helveticaBold, color: forestDark });
    page1.drawText(r[3], { x: 480, y: curY + 2, size: 8.5, font: helveticaBold, color: gold });
  });

  // Total Row
  const totalY = rowY - 26 - finRows.length * 20;
  page1.drawRectangle({
    x: 45,
    y: totalY - 5,
    width: width - 90,
    height: 22,
    color: forestDark,
  });
  page1.drawText("TOTAL DEPLOYED FUNDS", { x: 55, y: totalY + 3, size: 8.5, font: helveticaBold, color: white });
  page1.drawText("575.00", { x: 280, y: totalY + 3, size: 8.5, font: helveticaBold, color: white });
  page1.drawText("1,000.00", { x: 380, y: totalY + 3, size: 8.5, font: helveticaBold, color: gold });
  page1.drawText("100.0%", { x: 480, y: totalY + 3, size: 8.5, font: helveticaBold, color: white });

  // Footer on Page 1
  page1.drawLine({
    start: { x: 45, y: 50 },
    end: { x: width - 45, y: 50 },
    thickness: 0.5,
    color: dividerColor,
  });

  page1.drawText("Skymeredian Foundation · Annual Report 2025–26 · www.skymeredian.org · Page 1 of 2", {
    x: 45,
    y: 35,
    size: 8,
    font: helvetica,
    color: inkMuted,
  });

  // ================= PAGE 2: GOVERNANCE & STATUTORY CERTIFICATION =================
  const page2 = pdfDoc.addPage([595.28, 841.89]);

  // Page 2 Header Bar
  page2.drawRectangle({
    x: 0,
    y: height - 80,
    width: width,
    height: 80,
    color: forestDark,
  });

  page2.drawRectangle({
    x: 0,
    y: height - 5,
    width: width,
    height: 5,
    color: gold,
  });

  page2.drawText("SKYMEREDIAN FOUNDATION · GOVERNANCE & COMPLIANCE", {
    x: 45,
    y: height - 50,
    size: 14,
    font: helveticaBold,
    color: white,
  });

  // Section 4: Governance & Board Oversight
  page2.drawText("4. BOARD OF TRUSTEES & OVERSIGHT CADENCE", {
    x: 45,
    y: height - 120,
    size: 13,
    font: helveticaBold,
    color: forestDark,
  });

  page2.drawLine({
    start: { x: 45, y: height - 126 },
    end: { x: width - 45, y: height - 126 },
    thickness: 1.5,
    color: forestMedium,
  });

  const govText =
    "The Skymeredian Foundation is governed by an independent Board of Trustees convened quarterly to review " +
    "statutory accounts, safeguard frameworks, and partner agreements. Our compliance protocols ensure strict " +
    "segregation of duties, third-party fiscal audits, and full alignment with Indian NGO Darpan and Income Tax guidelines.";

  page2.drawText(govText, {
    x: 45,
    y: height - 150,
    size: 9.5,
    font: helvetica,
    color: inkDark,
    lineHeight: 14,
    maxWidth: width - 90,
  });

  const boardMembers = [
    { role: "Chairperson", name: "Dr. Arvind Sundaram", focus: "Public Policy & Rural Economics (Retd. IIMB)" },
    { role: "Founder & CEO", name: "Meera Rao", focus: "Public Health Systems & Community Development" },
    { role: "Treasurer & Trustee", name: "Sunil K. Varma, FCA", focus: "Statutory Financial Governance & Auditing" },
    { role: "Trustee (Safeguarding)", name: "Ananya Deshmukh", focus: "Child Protection, Ethics & Community Representation" },
  ];

  boardMembers.forEach((bm, i) => {
    const boxY = height - 220 - i * 46;
    page2.drawRectangle({
      x: 45,
      y: boxY - 36,
      width: width - 90,
      height: 38,
      color: forestLight,
      borderColor: dividerColor,
      borderWidth: 1,
    });

    page2.drawText(bm.role.toUpperCase(), {
      x: 55,
      y: boxY - 14,
      size: 8,
      font: helveticaBold,
      color: forestMedium,
    });

    page2.drawText(bm.name, {
      x: 55,
      y: boxY - 28,
      size: 10,
      font: helveticaBold,
      color: forestDark,
    });

    page2.drawText(bm.focus, {
      x: 230,
      y: boxY - 22,
      size: 9,
      font: helvetica,
      color: inkDark,
    });
  });

  // Section 5: Transparency & Donors Rights
  page2.drawText("5. DONOR TRANSPARENCY & TAX EXEMPTION ASSURANCE", {
    x: 45,
    y: height - 440,
    size: 13,
    font: helveticaBold,
    color: forestDark,
  });

  page2.drawLine({
    start: { x: 45, y: height - 446 },
    end: { x: width - 45, y: height - 446 },
    thickness: 1.5,
    color: forestMedium,
  });

  const taxDetails = [
    "• Section 80G Exemption: Registered under Section 80G(5)(vi) of the Income Tax Act, 1961. Unique Doc No. AABTS9821BF20214.",
    "• Section 12A Registration: Granted perpetual non-profit status under Section 12A with Commissioner of Income Tax.",
    "• 100% Tax Deductible Receipts: Automated digital receipts with QR code authentication issued instantly upon payment confirmation.",
    "• Foreign Contribution Regulation: International remittances routed strictly through authorised regulatory banking partners.",
  ];

  taxDetails.forEach((line, i) => {
    page2.drawText(line, {
      x: 45,
      y: height - 475 - i * 22,
      size: 9,
      font: helvetica,
      color: inkDark,
      maxWidth: width - 90,
    });
  });

  // Section 6: Official Audit Sign-off Box
  page2.drawRectangle({
    x: 45,
    y: height - 670,
    width: width - 90,
    height: 95,
    color: white,
    borderColor: forestMedium,
    borderWidth: 1.5,
  });

  page2.drawText("STATUTORY AUDIT & SIGN-OFF CERTIFICATION", {
    x: 55,
    y: height - 600,
    size: 9,
    font: helveticaBold,
    color: forestDark,
  });

  const certStatement =
    "We hereby certify that the financial accounts and program outcome statements of the Skymeredian Foundation " +
    "for the period ending March 31, 2026 have been examined against bank statements, vouchers, and governance ledgers, " +
    "and reflect a true and fair record of institutional operations.";

  page2.drawText(certStatement, {
    x: 55,
    y: height - 622,
    size: 8.5,
    font: helvetica,
    color: inkDark,
    lineHeight: 12,
    maxWidth: width - 110,
  });

  page2.drawText("M. K. Bhandari & Associates", {
    x: 55,
    y: height - 655,
    size: 9,
    font: helveticaBold,
    color: forestDark,
  });

  page2.drawText("Chartered Accountants (FRN: 014829N)", {
    x: 55,
    y: height - 665,
    size: 8,
    font: helvetica,
    color: inkMuted,
  });

  page2.drawText("Meera Rao", {
    x: 400,
    y: height - 655,
    size: 9,
    font: helveticaBold,
    color: forestDark,
  });

  page2.drawText("Chief Executive, Skymeredian", {
    x: 400,
    y: height - 665,
    size: 8,
    font: helvetica,
    color: inkMuted,
  });

  // Footer on Page 2
  page2.drawLine({
    start: { x: 45, y: 50 },
    end: { x: width - 45, y: 50 },
    thickness: 0.5,
    color: dividerColor,
  });

  page2.drawText("Skymeredian Foundation · Annual Report 2025–26 · contact: hello@skymeredian.org · Page 2 of 2", {
    x: 45,
    y: 35,
    size: 8,
    font: helvetica,
    color: inkMuted,
  });

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  const reportsDir = path.join(projectRoot, "public", "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const outputPath = path.join(reportsDir, "skymeredian-annual-report-2025-26.pdf");
  fs.writeFileSync(outputPath, pdfBytes);
  console.log("SUCCESS: Generated Annual Report PDF at", outputPath);
}

createAnnualReport().catch((err) => {
  console.error("ERROR generating PDF:", err);
  process.exit(1);
});
