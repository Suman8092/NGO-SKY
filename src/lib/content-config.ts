type ContentEnvironment = {
  NODE_ENV?: string;
  VERCEL_ENV?: string;
  NEXT_PUBLIC_CONTENT_VERIFIED?: string;
};

export function isEditorialContentPublished(
  env: ContentEnvironment = process.env,
): boolean {
  const vercelEnvironment = env.VERCEL_ENV?.trim().toLowerCase();
  const requiresExplicitApproval =
    vercelEnvironment === "production" ||
    vercelEnvironment === "preview" ||
    env.NODE_ENV === "production";

  if (!requiresExplicitApproval) return true;
  return ["1", "true", "yes", "on"].includes(
    env.NEXT_PUBLIC_CONTENT_VERIFIED?.trim().toLowerCase() ?? "",
  );
}
