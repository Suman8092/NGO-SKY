import { auth } from "@clerk/nextjs/server";
import { isAdminUserId, isClerkConfigured } from "@/lib/auth-config";
import { ApiError } from "@/lib/server/errors";
import { connectMongo } from "@/lib/server/db";
import { errorResponse, getRequestId, jsonSuccess } from "@/lib/server/http";
import { EventRegistrationModel } from "@/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireEventStaff() {
  if (!isClerkConfigured()) throw new ApiError(403, "FORBIDDEN", "Staff access required.");
  const { userId } = await auth();
  if (!isAdminUserId(userId)) throw new ApiError(403, "FORBIDDEN", "Staff access required.");
}

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    await requireEventStaff();
    const url = new URL(request.url);
    const code = url.searchParams.get("code")?.trim().toUpperCase();

    if (!code || !/^TKT-[A-F0-9]{8}$/i.test(code)) {
      throw new ApiError(
        400,
        "INVALID_CODE",
        "Valid pass code required (e.g. TKT-XXXXXXXX).",
      );
    }

    const conn = await connectMongo();
    if (!conn) {
      throw new ApiError(
        503,
        "DATABASE_UNAVAILABLE",
        "Database unavailable. Please try again.",
      );
    }

    const doc = await EventRegistrationModel.findOne({ ticketCode: code }).lean();
    if (!doc) {
      throw new ApiError(
        404,
        "PASS_NOT_FOUND",
        "No matching event pass was found for this code.",
      );
    }

    return jsonSuccess({
      ticketCode: doc.ticketCode,
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      eventTitle: doc.eventTitle,
      eventDate: doc.eventDate,
      eventLocation: doc.eventLocation,
      ticketsCount: doc.ticketsCount,
      notes: doc.notes,
      status: doc.status,
      registeredAt: doc.createdAt?.toISOString(),
    });
  } catch (error) {
    return errorResponse(error, requestId, "api.events.checkin.get");
  }
}

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request);

  try {
    await requireEventStaff();
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const code = String(body.ticketCode || "").trim().toUpperCase();
    const action = String(body.action || "check_in").trim();

    if (!code || !/^TKT-[A-F0-9]{8}$/i.test(code)) {
      throw new ApiError(400, "INVALID_CODE", "Valid pass code required.");
    }

    const conn = await connectMongo();
    if (!conn) {
      throw new ApiError(503, "DATABASE_UNAVAILABLE", "Database unavailable.");
    }

    if (!["check_in", "cancel"].includes(action)) {
      throw new ApiError(400, "INVALID_ACTION", "Choose check_in or cancel.");
    }
    const newStatus = action === "cancel" ? "cancelled" : "attended";
    const doc = await EventRegistrationModel.findOneAndUpdate(
      { ticketCode: code, status: { $in: ["confirmed", newStatus] } },
      { $set: { status: newStatus } },
      { new: true },
    ).lean();

    if (!doc) {
      throw new ApiError(404, "PASS_NOT_FOUND", "No matching pass found.");
    }

    return jsonSuccess({
      ticketCode: doc.ticketCode,
      status: doc.status,
      name: doc.name,
      eventTitle: doc.eventTitle,
      message:
        newStatus === "attended"
          ? `Successfully checked in ${doc.name} (${doc.ticketsCount} seats).`
          : `Registration marked as cancelled.`,
    });
  } catch (error) {
    return errorResponse(error, requestId, "api.events.checkin.post");
  }
}
