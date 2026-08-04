type AuthEnvironment = {
  [key: string]: string | undefined;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  CLERK_SECRET_KEY?: string;
  DEMO_MODE?: string;
};

export function isClerkConfigured(env: AuthEnvironment = process.env): boolean {
  return Boolean(
    env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() && env.CLERK_SECRET_KEY?.trim(),
  );
}

export function isDemoModeEnabled(env: AuthEnvironment = process.env): boolean {
  return ["1", "true", "yes", "on"].includes(env.DEMO_MODE?.trim().toLowerCase() ?? "");
}
