import { NgoRecordModel } from "@/models/NgoRecord";
import { ngoActor, requireNgoDatabase } from "@/lib/server/ngo/access";
import { reconcileHostedPayment } from "@/lib/server/ngo/hosted-payments";
import { errorResponse, getRequestId, jsonSuccess } from "@/lib/server/http";
import { ApiError } from "@/lib/server/errors";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await ngoActor(true);
    const { id } = await params;
    if (!/^[a-f0-9]{24}$/i.test(id))
      throw new ApiError(404, "NOT_FOUND", "Payment not found.");
    await requireNgoDatabase();
    const item = await NgoRecordModel.findOne({
      _id: id,
      module: "gateway-payments",
    });
    if (!item) throw new ApiError(404, "NOT_FOUND", "Payment not found.");
    return jsonSuccess(await reconcileHostedPayment(id, item.downloadToken));
  } catch (e) {
    return errorResponse(e, getRequestId(request), "admin-payment-refresh");
  }
}
