import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";

import { isAdminUserId, isClerkConfigured } from "@/lib/auth-config";
import { ApiError } from "@/lib/server/errors";
import { errorResponse, getRequestId, jsonSuccess, parseJsonRequest } from "@/lib/server/http";
import {
  updateContactStatus,
  updateVolunteerStatus,
} from "@/lib/server/operations";
import { fetchCachedPublishedContent } from "@/lib/server/cms/sanity-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request);

  try {
    let userId: string | null = null;
    if (isClerkConfigured()) {
      try {
        const authResult = await auth();
        userId = authResult.userId;
      } catch {
        userId = null;
      }
    }

    if (!isClerkConfigured() || !isAdminUserId(userId)) {
      throw new ApiError(
        403,
        "FORBIDDEN",
        "Administrative privileges are required to perform this operation.",
      );
    }

    const body = await parseJsonRequest(request, z.object({
      action: z.string().trim().min(1).max(80),
      id: z.string().trim().max(100).optional(),
      status: z.string().trim().max(30).optional(),
    }).strict());
    const action = String(body.action || "").trim();

    if (action === "update_volunteer_status") {
      const id = String(body.id || "").trim();
      const status = String(body.status || "").trim() as
        | "submitted"
        | "reviewing"
        | "approved"
        | "rejected";

      if (
        !id ||
        !["submitted", "reviewing", "approved", "rejected"].includes(status)
      ) {
        throw new ApiError(
          400,
          "INVALID_INPUT",
          "A valid application ID and status are required.",
        );
      }

      const result = await updateVolunteerStatus(id, status);
      if (result.state === "unavailable") {
        throw new ApiError(503, "DATABASE_UNAVAILABLE", "Database unavailable.");
      }
      if (!result.data) {
        throw new ApiError(404, "NOT_FOUND", "Volunteer application not found.");
      }

      return jsonSuccess({
        action,
        record: result.data,
      });
    }

    if (action === "update_contact_status") {
      const id = String(body.id || "").trim();
      const status = String(body.status || "").trim() as
        | "new"
        | "read"
        | "resolved"
        | "spam";

      if (
        !id ||
        !["new", "read", "resolved", "spam"].includes(status)
      ) {
        throw new ApiError(
          400,
          "INVALID_INPUT",
          "A valid enquiry ID and status are required.",
        );
      }

      const result = await updateContactStatus(id, status);
      if (result.state === "unavailable") {
        throw new ApiError(503, "DATABASE_UNAVAILABLE", "Database unavailable.");
      }
      if (!result.data) {
        throw new ApiError(404, "NOT_FOUND", "Contact enquiry not found.");
      }

      return jsonSuccess({
        action,
        record: result.data,
      });
    }

    if (action === "sync_sanity_content") {
      // Revalidate Next.js cache tags for Sanity content
      const tags = ["campaign", "event", "program", "successStory", "post"];
      for (const tag of tags) {
        try {
          revalidateTag(tag);
        } catch {
          // Ignore cache tags in test/standalone environments
        }
      }

      // Fetch freshly cached published content
      const [campaignsResult, eventsResult, programsResult, storiesResult] =
        await Promise.all([
          fetchCachedPublishedContent("campaigns", 50),
          fetchCachedPublishedContent("events", 50),
          fetchCachedPublishedContent("programs", 50),
          fetchCachedPublishedContent("stories", 50),
        ]);

      return jsonSuccess({
        action,
        revalidatedAt: new Date().toISOString(),
        publishedDocuments: {
          campaigns: campaignsResult.data.length,
          events: eventsResult.data.length,
          programs: programsResult.data.length,
          stories: storiesResult.data.length,
        },
      });
    }

    throw new ApiError(400, "UNKNOWN_ACTION", `Unrecognized action: ${action}`);
  } catch (error) {
    return errorResponse(error, requestId, "admin-operations");
  }
}
