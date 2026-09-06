type AuthEnvironment = {
  [key: string]: string | undefined;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  CLERK_SECRET_KEY?: string;
  DEMO_MODE?: string;
  ADMIN_USER_IDS?: string;
  NODE_ENV?: string;
  VERCEL_ENV?: string;
  ALLOW_DEV_KEYS?: string;
};

export function isLiveProductionEnvironment(
  env: AuthEnvironment = process.env,
): boolean {
  if (
    ["1", "true", "yes", "on"].includes(
      env.ALLOW_DEV_KEYS?.trim().toLowerCase() ?? "",
    )
  ) {
    return false;
  }
  const vercelEnvironment = env.VERCEL_ENV?.trim().toLowerCase();
  if (vercelEnvironment === "production") return true;
  if (["preview", "development"].includes(vercelEnvironment ?? "")) {
    return false;
  }
  return env.NODE_ENV === "production";
}

export function isClerkUiEnabled(env: AuthEnvironment = process.env): boolean {
  const publishableKey = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  return Boolean(
    publishableKey &&
    (!isLiveProductionEnvironment(env) ||
      publishableKey.startsWith("pk_live_")),
  );
}

export function isClerkConfigured(env: AuthEnvironment = process.env): boolean {
  const secretKey = env.CLERK_SECRET_KEY?.trim();
  return Boolean(
    isClerkUiEnabled(env) &&
    secretKey &&
    (!isLiveProductionEnvironment(env) || secretKey.startsWith("sk_live_")),
  );
}

export function isDemoModeEnabled(env: AuthEnvironment = process.env): boolean {
  if (isLiveProductionEnvironment(env)) return false;
  return ["1", "true", "yes", "on"].includes(
    env.DEMO_MODE?.trim().toLowerCase() ?? "",
  );
}

export function getAdminUserIds(env: AuthEnvironment = process.env): string[] {
  return Array.from(
    new Set(
      (env.ADMIN_USER_IDS ?? "")
        .split(",")
        .map((userId) => userId.trim())
        .filter(Boolean),
    ),
  );
}

export function isAdminUserId(
  userId: string | null | undefined,
  env: AuthEnvironment = process.env,
): boolean {
  return Boolean(userId && getAdminUserIds(env).includes(userId));
}
