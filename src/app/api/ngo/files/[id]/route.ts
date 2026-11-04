import { GridFSBucket, ObjectId } from "mongodb";
import { ngoActor, requireNgoDatabase } from "@/lib/server/ngo/access";
import { ApiError } from "@/lib/server/errors";
import { errorResponse, getRequestId } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!/^[a-f0-9]{24}$/i.test(id))
      throw new ApiError(404, "NOT_FOUND", "File not found.");
    const db = (await requireNgoDatabase()).connection.db!;
    const bucket = new GridFSBucket(db, { bucketName: "ngoUploads" });
    const file = await bucket.find({ _id: new ObjectId(id) }).next();
    if (!file) throw new ApiError(404, "NOT_FOUND", "File not found.");
    if (!file.metadata?.publicImage) {
      const actor = await ngoActor();
      if (!actor.admin && file.metadata?.ownerId !== actor.id)
        throw new ApiError(403, "FORBIDDEN", "This document is private.");
    }
    const chunks: Buffer[] = [];
    for await (const chunk of bucket.openDownloadStream(file._id))
      chunks.push(Buffer.from(chunk));
    return new Response(Buffer.concat(chunks), {
      headers: {
        "Content-Type": String(
          file.metadata?.contentType ?? "application/octet-stream",
        ),
        "Content-Disposition": `${file.metadata?.publicImage ? "inline" : "attachment"}; filename="${file.filename}"`,
        "Cache-Control": file.metadata?.publicImage
          ? "public, max-age=3600"
          : "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-file");
  }
}
