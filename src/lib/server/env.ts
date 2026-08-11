import { z } from "zod";

const optionalString = (schema: z.ZodString = z.string()) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    schema.optional(),
  );

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  VERCEL_ENV: optionalString(
    z.string().regex(/^(?:production|preview|development)$/),
  ),
  DEMO_MODE: booleanFromEnv.default(false),
  DONATIONS_ENABLED: booleanFromEnv.default(false),
  PUBLIC_SUBMISSIONS_ENABLED: booleanFromEnv.default(false),
  MONGODB_URI: optionalString(
    z
      .string()
      .regex(/^mongodb(?:\+srv)?:\/\//i, "Expected a MongoDB connection URI"),
  ),
  MONGODB_DB_NAME: optionalString(z.string().min(1).max(64)).default(
    "ashaaya-foundation",
  ),
  NEXT_PUBLIC_SITE_URL: optionalString(z.string().url()).default(
    "http://localhost:3000",
  ),
  STRIPE_SECRET_KEY: optionalString(z.string().startsWith("sk_").min(16)),
  STRIPE_WEBHOOK_SECRET: optionalString(
    z.string().startsWith("whsec_").min(16),
  ),
  RAZORPAY_KEY_ID: optionalString(z.string().startsWith("rzp_").min(8)),
  RAZORPAY_KEY_SECRET: optionalString(z.string().min(8)),
  RAZORPAY_WEBHOOK_SECRET: optionalString(z.string().min(8)),
  RESEND_API_KEY: optionalString(z.string().startsWith("re_").min(8)),
  RESEND_FROM_EMAIL: optionalString(
    z
      .string()
      .min(3)
      .max(200)
      .regex(/^[^\r\n]+$/),
  ),
  CONTACT_NOTIFICATION_EMAIL: optionalString(z.string().email()),
  SANITY_PROJECT_ID: optionalString(
    z
      .string()
      .regex(/^[a-z0-9-]+$/i)
      .max(80),
  ),
  NEXT_PUBLIC_SANITY_PROJECT_ID: optionalString(
    z
      .string()
      .regex(/^[a-z0-9-]+$/i)
      .max(80),
  ),
  SANITY_DATASET: optionalString(
    z
      .string()
      .regex(/^[a-z0-9_-]+$/i)
      .max(80),
  ),
  NEXT_PUBLIC_SANITY_DATASET: optionalString(
    z
      .string()
      .regex(/^[a-z0-9_-]+$/i)
      .max(80),
  ),
  SANITY_API_VERSION: optionalString(
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ).default("2025-02-19"),
  SANITY_API_TOKEN: optionalString(z.string().min(8)),
  SANITY_REVALIDATE_SECRET: optionalString(z.string().min(16)),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
});

export type ServerEnv = z.infer<typeof envSchema>;

let cachedEnv: ServerEnv | undefined;
let cachedIssues: string[] = [];

function isSafePublicHttpsUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const local =
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("127.") ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname === "[::1]";
    return (
      url.protocol === "https:" &&
      !local &&
      !url.username &&
      !url.password &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

function productionSafetyIssues(): string[] {
  if (!isProductionRuntime()) return [];

  const issues: string[] = [];
  const demoMode = ["1", "true", "yes", "on"].includes(
    process.env.DEMO_MODE?.trim().toLowerCase() ?? "",
  );
  const donationsEnabled = ["1", "true", "yes", "on"].includes(
    process.env.DONATIONS_ENABLED?.trim().toLowerCase() ?? "",
  );
  const publicSubmissionsEnabled = ["1", "true", "yes", "on"].includes(
    process.env.PUBLIC_SUBMISSIONS_ENABLED?.trim().toLowerCase() ?? "",
  );
  const mongoUri = process.env.MONGODB_URI?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const stripeSecret = process.env.STRIPE_SECRET_KEY?.trim();
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID?.trim();
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const resendFromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  const contactNotificationEmail =
    process.env.CONTACT_NOTIFICATION_EMAIL?.trim();

  if (demoMode) issues.push("DEMO_MODE");
  if (!mongoUri) issues.push("MONGODB_URI");
  if (donationsEnabled && !isSafePublicHttpsUrl(siteUrl)) {
    issues.push("NEXT_PUBLIC_SITE_URL");
  }
  if (publicSubmissionsEnabled && !resendApiKey) {
    issues.push("RESEND_API_KEY");
  }
  if (publicSubmissionsEnabled && !resendFromEmail) {
    issues.push("RESEND_FROM_EMAIL");
  }
  if (publicSubmissionsEnabled && !contactNotificationEmail) {
    issues.push("CONTACT_NOTIFICATION_EMAIL");
  }
  if (stripeSecret && !stripeSecret.startsWith("sk_live_")) {
    issues.push("STRIPE_SECRET_KEY");
  }
  if (razorpayKeyId && !razorpayKeyId.startsWith("rzp_live_")) {
    issues.push("RAZORPAY_KEY_ID");
  }

  return issues;
}

export function getServerEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse(process.env);
  if (parsed.success) {
    cachedEnv = parsed.data;
    cachedIssues = productionSafetyIssues();
    return cachedEnv;
  }

  cachedIssues = [
    ...new Set([
      ...parsed.error.issues.map((issue) => issue.path.join(".")),
      ...productionSafetyIssues(),
    ]),
  ];
  const fallback = envSchema.parse({});
  cachedEnv = fallback;
  return fallback;
}

export function getEnvironmentIssues(): readonly string[] {
  getServerEnv();
  return cachedIssues;
}

export function isForcedDemoMode(): boolean {
  return getServerEnv().DEMO_MODE;
}

export function isProductionRuntime(): boolean {
  const vercelEnvironment = process.env.VERCEL_ENV?.trim().toLowerCase();
  if (vercelEnvironment === "production") return true;
  if (vercelEnvironment === "preview" || vercelEnvironment === "development") {
    return false;
  }
  return process.env.NODE_ENV === "production";
}

export function allowsInMemoryPersistence(): boolean {
  return !isProductionRuntime();
}

export function isDonationsEnabled(): boolean {
  return getServerEnv().DONATIONS_ENABLED;
}

export function isPublicSubmissionsEnabled(): boolean {
  const env = getServerEnv();
  return (
    env.PUBLIC_SUBMISSIONS_ENABLED &&
    hasMongoConfig() &&
    hasResendConfig()
  );
}

export function hasManagedSubmissionWorkflow(): boolean {
  return (
    isPublicSubmissionsEnabled() &&
    Boolean(getServerEnv().CONTACT_NOTIFICATION_EMAIL)
  );
}

export function hasSafePaymentRedirectOrigin(): boolean {
  return (
    !isProductionRuntime() ||
    isSafePublicHttpsUrl(getServerEnv().NEXT_PUBLIC_SITE_URL)
  );
}

export function hasMongoConfig(): boolean {
  const env = getServerEnv();
  return !env.DEMO_MODE && Boolean(env.MONGODB_URI);
}

export function hasStripeConfig(): boolean {
  const env = getServerEnv();
  const liveKeyReady =
    !isProductionRuntime() ||
    Boolean(env.STRIPE_SECRET_KEY?.startsWith("sk_live_"));
  return (
    !env.DEMO_MODE &&
    liveKeyReady &&
    Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET)
  );
}

export function hasRazorpayConfig(): boolean {
  const env = getServerEnv();
  const liveKeyReady =
    !isProductionRuntime() ||
    Boolean(env.RAZORPAY_KEY_ID?.startsWith("rzp_live_"));
  return (
    !env.DEMO_MODE &&
    liveKeyReady &&
    Boolean(
      env.RAZORPAY_KEY_ID &&
      env.RAZORPAY_KEY_SECRET &&
      env.RAZORPAY_WEBHOOK_SECRET,
    )
  );
}

export function hasResendConfig(): boolean {
  const env = getServerEnv();
  return !env.DEMO_MODE && Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL);
}

export function hasSanityConfig(): boolean {
  const env = getServerEnv();
  return (
    !env.DEMO_MODE &&
    Boolean(
      (env.SANITY_PROJECT_ID ?? env.NEXT_PUBLIC_SANITY_PROJECT_ID) &&
      (env.SANITY_DATASET ?? env.NEXT_PUBLIC_SANITY_DATASET),
    )
  );
}
