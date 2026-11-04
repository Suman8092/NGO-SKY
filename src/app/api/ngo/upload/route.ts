import { GridFSBucket } from "mongodb";
import { ngoActor, requireNgoDatabase } from "@/lib/server/ngo/access";
import { ApiError } from "@/lib/server/errors";
import { errorResponse, getRequestId, jsonSuccess } from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const actor = await ngoActor();
    if (!actor.admin && !actor.coordinator)
      throw new ApiError(403, "FORBIDDEN", "Staff upload access required.");
    await enforceRateLimit("ngo-upload", actor.id, {
      limit: 30,
      windowMs: 3600000,
    });
    if (Number(request.headers.get("content-length")) > 3500000)
      throw new ApiError(
        413,
        "FILE_TOO_LARGE",
        "Files must be smaller than 3 MB.",
      );
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size < 1 || file.size > 3000000)
      throw new ApiError(
        422,
        "INVALID_FILE",
        "Choose a JPEG, PNG, or PDF smaller than 3 MB.",
      );
    const data = Buffer.from(await file.arrayBuffer());
    const mime = data
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      ? "image/png"
      : data[0] === 255 && data[1] === 216 && data[2] === 255
        ? "image/jpeg"
        : data.subarray(0, 5).toString() === "%PDF-"
          ? "application/pdf"
          : null;
    if (!mime)
      throw new ApiError(
        422,
        "UNSUPPORTED_FILE",
        "Only JPEG, PNG, and PDF files are accepted.",
      );
    const publicImage =
      actor.admin &&
      form.get("publicImage") === "true" &&
      mime.startsWith("image/");
    const db = (await requireNgoDatabase()).connection.db!;
    const bucket = new GridFSBucket(db, { bucketName: "ngoUploads" });
    const stream = bucket.openUploadStream(
      file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100),
      { metadata: { ownerId: actor.id, contentType: mime, publicImage } },
    );
    await new Promise<void>((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
      stream.end(data);
    });
    return jsonSuccess({ url: `/api/ngo/files/${stream.id}`, publicImage });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-upload");
  }
}
