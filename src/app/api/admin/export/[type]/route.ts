import { auth } from "@clerk/nextjs/server";
import { isAdminUserId } from "@/lib/auth-config";
import { connectMongo } from "@/lib/server/db";
import {
  ContactSubmissionModel,
  DonationModel,
  EventRegistrationModel,
  VolunteerApplicationModel,
} from "@/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeCsvCell(cell: unknown): string {
  if (cell === null || cell === undefined) return '""';
  const raw = String(cell);
  const safe = /^[\s]*[=+@-]/.test(raw) ? `'${raw}` : raw;
  const str = safe.replace(/"/g, '""');
  return `"${str}"`;
}

function toCsvRow(cells: unknown[]): string {
  return cells.map(escapeCsvCell).join(",");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> },
): Promise<Response> {
  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch {
    userId = null;
  }

  if (!isAdminUserId(userId)) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: { code: "FORBIDDEN", message: "Admin access required." },
      }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  const { type } = await params;
  const conn = await connectMongo();
  if (!conn) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "Database connection unavailable.",
        },
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  const dateStr = new Date().toISOString().split("T")[0];
  let filename = `export_${type}_${dateStr}.csv`;
  const rows: string[] = [];

  switch (type) {
    case "donations": {
      filename = `skymeredian_donations_${dateStr}.csv`;
      rows.push(
        toCsvRow([
          "Donation ID",
          "Date & Time (UTC)",
          "Donor Name",
          "Donor Email",
          "Donor Phone",
          "Country",
          "Amount (Minor)",
          "Amount",
          "Currency",
          "Frequency",
          "Status",
          "Provider",
          "External Order ID",
          "External Payment ID",
        ]),
      );

      const docs = await DonationModel.find({}).sort({ createdAt: -1 }).lean();
      for (const d of docs) {
        rows.push(
          toCsvRow([
            d._id.toString(),
            d.createdAt?.toISOString(),
            d.donor?.name,
            d.donor?.email,
            d.donor?.phone,
            d.donor?.country,
            d.amountMinor,
            (d.amountMinor / 100).toFixed(2),
            d.currency,
            d.frequency,
            d.status,
            d.provider,
            d.externalOrderId,
            d.externalPaymentId,
          ]),
        );
      }
      break;
    }

    case "volunteers": {
      filename = `skymeredian_volunteers_${dateStr}.csv`;
      rows.push(
        toCsvRow([
          "Application ID",
          "Application Date",
          "Full Name",
          "Email Address",
          "Phone Number",
          "City",
          "Country",
          "Area of Interest",
          "Availability",
          "Status",
          "Motivation",
          "Experience",
        ]),
      );

      const docs = await VolunteerApplicationModel.find({})
        .sort({ createdAt: -1 })
        .lean();
      for (const v of docs) {
        rows.push(
          toCsvRow([
            v._id.toString(),
            v.createdAt?.toISOString(),
            v.name,
            v.email,
            v.phone,
            v.city,
            v.country,
            v.areaOfInterest,
            v.availability,
            v.status,
            v.motivation,
            v.experience,
          ]),
        );
      }
      break;
    }

    case "events": {
      filename = `skymeredian_event_roster_${dateStr}.csv`;
      rows.push(
        toCsvRow([
          "Pass Code",
          "Registration Date",
          "Event ID",
          "Event Title",
          "Event Date",
          "Event Location",
          "Attendee Name",
          "Attendee Email",
          "Attendee Phone",
          "Seats Reserved",
          "Special Notes / Needs",
          "Status",
        ]),
      );

      const docs = await EventRegistrationModel.find({})
        .sort({ createdAt: -1 })
        .lean();
      for (const e of docs) {
        rows.push(
          toCsvRow([
            e.ticketCode,
            e.createdAt?.toISOString(),
            e.eventId,
            e.eventTitle,
            e.eventDate,
            e.eventLocation,
            e.name,
            e.email,
            e.phone,
            e.ticketsCount,
            e.notes,
            e.status,
          ]),
        );
      }
      break;
    }

    case "contacts": {
      filename = `skymeredian_enquiries_${dateStr}.csv`;
      rows.push(
        toCsvRow([
          "Submission ID",
          "Date Received",
          "Name",
          "Email",
          "Phone",
          "Subject",
          "Status",
          "Message",
        ]),
      );

      const docs = await ContactSubmissionModel.find({})
        .sort({ createdAt: -1 })
        .lean();
      for (const c of docs) {
        rows.push(
          toCsvRow([
            c._id.toString(),
            c.createdAt?.toISOString(),
            c.name,
            c.email,
            c.phone,
            c.subject,
            c.status,
            c.message,
          ]),
        );
      }
      break;
    }

    default:
      return new Response(
        JSON.stringify({
          ok: false,
          error: { code: "INVALID_EXPORT_TYPE", message: "Unknown export type." },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
  }

  const csvContent = "\uFEFF" + rows.join("\r\n"); // UTF-8 BOM for Excel compatibility

  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
