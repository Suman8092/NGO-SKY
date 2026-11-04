import { auth, currentUser } from "@clerk/nextjs/server";
import { isAdminUserId, isClerkConfigured } from "@/lib/auth-config";
import { NgoRecordModel } from "@/models/NgoRecord";



import { ApiError } from "@/lib/server/errors";
import { errorResponse, getRequestId } from "@/lib/server/http";
import { findDonation } from "@/lib/server/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    if (!isClerkConfigured()) throw new ApiError(503, "AUTH_UNAVAILABLE", "Sign-in is required to download a receipt.");
    const { userId } = await auth();
    if (!userId) throw new ApiError(401, "UNAUTHORIZED", "Please sign in to download your receipt.");
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
    if (!isAdminUserId(userId) && donation.accountUserId !== userId) {
      const user = await currentUser();
      const verifiedOwner = !donation.accountUserId && user?.emailAddresses.some(
        (email) => email.verification?.status === "verified" && email.emailAddress.toLowerCase() === donation.donor.email.toLowerCase(),
      );
      if (!verifiedOwner) throw new ApiError(403, "FORBIDDEN", "This receipt belongs to another account.");
    }
    if (donation.status !== "paid") {
      throw new ApiError(
        400,
        "RECEIPT_NOT_READY",
        "Receipt is only available for confirmed (paid) donations.",
      );
    }


    const {onlineReceipt}=await import("@/lib/server/ngo/payments");
    const {renderNgoDocument}=await import("@/lib/server/ngo/documents");
    await onlineReceipt(id, undefined, false);
    const document = await NgoRecordModel.findOne({ identityKey: `online-receipt:${id}` });
    if (!document) throw new ApiError(503, "RECEIPT_UNAVAILABLE", "The receipt register is temporarily unavailable.");
    return new Response(await renderNgoDocument(document), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${document.reference}.pdf"`, "Cache-Control": "private, no-store" } });
  } catch (error) {
    return errorResponse(error, requestId, "donation-receipt");
  }
}
