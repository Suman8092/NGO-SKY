import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

import { DonorProfileModel } from "@/models";
import { connectMongo } from "@/lib/server/db";
import { ApiError } from "@/lib/server/errors";
import { errorResponse, getRequestId, jsonSuccess } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const taxProfileSchema = z.object({
  legalName: z.string().trim().min(2).max(120),
  panNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please enter a valid 10-character Indian PAN number (e.g. ABCDE1234F)"),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  pincode: z.string().trim().max(10).optional(),
});

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required.");
    }

    const connection = await connectMongo();
    if (!connection) {
      return jsonSuccess({ profile: null });
    }

    const profile = await DonorProfileModel.findOne({ accountUserId: userId }).lean();
    return jsonSuccess({
      profile: profile
        ? {
            legalName: profile.legalName,
            panNumber: profile.panNumber,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            pincode: profile.pincode,
            updatedAt: profile.updatedAt.toISOString(),
          }
        : null,
    });
  } catch (error) {
    return errorResponse(error, requestId, "get-tax-profile");
  }
}

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required.");
    }

    const user = await currentUser();
    const primaryEmail =
      user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() ?? "donor@skymeredian.org";

    const body = await request.json().catch(() => ({}));
    const parsed = taxProfileSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        422,
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message || "Invalid tax profile data.",
      );
    }

    const connection = await connectMongo();
    if (!connection) {
      throw new ApiError(
        503,
        "DATABASE_UNAVAILABLE",
        "Durable database connection required to store tax profile.",
      );
    }

    const updated = await DonorProfileModel.findOneAndUpdate(
      { accountUserId: userId },
      {
        $set: {
          accountUserId: userId,
          email: primaryEmail,
          legalName: parsed.data.legalName,
          panNumber: parsed.data.panNumber,
          address: parsed.data.address,
          city: parsed.data.city,
          state: parsed.data.state,
          pincode: parsed.data.pincode,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return jsonSuccess({
      message: "80G Tax Profile saved successfully.",
      profile: {
        legalName: updated.legalName,
        panNumber: updated.panNumber,
        address: updated.address,
        city: updated.city,
        state: updated.state,
        pincode: updated.pincode,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    return errorResponse(error, requestId, "update-tax-profile");
  }
}

