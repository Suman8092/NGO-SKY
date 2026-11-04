import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { isAdminUserId, isClerkConfigured } from "@/lib/auth-config";
import { NgoRecordModel } from "@/models/NgoRecord";
import { connectMongo } from "../db";
import { ApiError } from "../errors";
export type NgoActor = { id: string; admin: boolean; coordinator?: string };
export async function requireNgoDatabase() {
  const connection = await connectMongo();
  if (!connection)
    throw new ApiError(
      503,
      "DATABASE_UNAVAILABLE",
      "Durable storage is unavailable. Please try again later.",
    );
  return connection;
}
export async function ngoActor(adminOnly = false): Promise<NgoActor> {
  if (!isClerkConfigured())
    throw new ApiError(
      503,
      "AUTH_UNAVAILABLE",
      "Secure sign-in is unavailable.",
    );
  const { userId } = await auth();
  if (!userId)
    throw new ApiError(401, "UNAUTHORIZED", "Please sign in to continue.");
  const admin = isAdminUserId(userId);
  if (adminOnly && !admin)
    throw new ApiError(403, "FORBIDDEN", "Administrator access is required.");
  if (admin) return { id: userId, admin: true };
  await requireNgoDatabase();
  const coordinator = await NgoRecordModel.findOne({
    module: "coordinators",
    "data.accountUserId": userId,
    status: "active",
    deletedAt: null,
  })
    .select("_id")
    .lean();
  return { id: userId, admin: false, coordinator: coordinator?._id.toString() };
}
export async function verifiedAccount() {
  const actor = await ngoActor();
  const user = await currentUser();
  const email = user?.emailAddresses
    .find((e) => e.verification?.status === "verified")
    ?.emailAddress.toLowerCase();
  if (!email)
    throw new ApiError(
      403,
      "EMAIL_NOT_VERIFIED",
      "Verify an email address on your account before submitting an application.",
    );
  return { actor, email, name: user?.fullName ?? user?.firstName ?? "" };
}
