"use server";

import { redirect } from "next/navigation";

import { ApiError, safeLogError } from "@/lib/server/errors";
import { unsubscribeFromNewsletter } from "@/lib/server/services/submissions";

type UnsubscribePageStatus = "unsubscribed" | "invalid" | "unavailable";

function unsubscribePageUrl(status: UnsubscribePageStatus): string {
  return `/newsletter/unsubscribe?status=${status}`;
}

export async function unsubscribeNewsletterAction(
  formData: FormData,
): Promise<never> {
  const value = formData.get("token");
  const token = typeof value === "string" ? value : "";
  let status: UnsubscribePageStatus;

  try {
    status = await unsubscribeFromNewsletter(token);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status >= 500) {
      safeLogError("newsletter-unsubscribe", error);
      status = "unavailable";
    } else {
      status = "invalid";
    }
  }

  redirect(unsubscribePageUrl(status));
}
