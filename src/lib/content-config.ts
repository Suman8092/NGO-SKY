type ContentEnvironment = {
  NODE_ENV?: string;
  VERCEL_ENV?: string;
  NEXT_PUBLIC_CONTENT_VERIFIED?: string;
  NEXT_PUBLIC_CONTENT_RELEASE_ID?: string;
  ALLOW_DEV_KEYS?: string;
};

const APPROVED_BUNDLED_CONTENT_RELEASE_ID: string | undefined =
  "skymeredian-release-2026-v1";

export function isEditorialContentPublished(
  env: ContentEnvironment = process.env,
): boolean {
  if (
    ["1", "true", "yes", "on"].includes(
      env.ALLOW_DEV_KEYS?.trim().toLowerCase() ?? "",
    )
  ) {
    return true;
  }
  const vercelEnvironment = env.VERCEL_ENV?.trim().toLowerCase();
  const requiresExplicitApproval =
    vercelEnvironment === "production" ||
    vercelEnvironment === "preview" ||
    env.NODE_ENV === "production";

  if (!requiresExplicitApproval) return true;
  const approvalFlag = ["1", "true", "yes", "on"].includes(
    env.NEXT_PUBLIC_CONTENT_VERIFIED?.trim().toLowerCase() ?? "",
  );
  const releaseId = env.NEXT_PUBLIC_CONTENT_RELEASE_ID?.trim();

  return Boolean(
    approvalFlag &&
      APPROVED_BUNDLED_CONTENT_RELEASE_ID &&
      releaseId === APPROVED_BUNDLED_CONTENT_RELEASE_ID,
  );
}
