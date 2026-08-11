import { describe, expect, it } from "vitest";

import {
  getAdminUserIds,
  isAdminUserId,
  isClerkConfigured,
  isClerkUiEnabled,
  isDemoModeEnabled,
  isLiveProductionEnvironment,
} from "./auth-config";

describe("authentication configuration", () => {
  it("requires a matching Clerk key pair to enable authentication", () => {
    expect(
      isClerkConfigured({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_example",
        CLERK_SECRET_KEY: "sk_test_example",
      }),
    ).toBe(true);
    expect(
      isClerkConfigured({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_example",
      }),
    ).toBe(false);
    expect(isClerkConfigured({ CLERK_SECRET_KEY: "sk_test_example" })).toBe(
      false,
    );
  });

  it("rejects Clerk development keys in production", () => {
    const productionTestKeys = {
      NODE_ENV: "production",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_example",
      CLERK_SECRET_KEY: "sk_test_example",
    };
    expect(isClerkUiEnabled(productionTestKeys)).toBe(false);
    expect(isClerkConfigured(productionTestKeys)).toBe(false);
    expect(
      isClerkConfigured({
        NODE_ENV: "production",
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_live_example",
        CLERK_SECRET_KEY: "sk_live_example",
      }),
    ).toBe(true);
  });

  it("allows Clerk development keys in a Vercel Preview deployment", () => {
    const previewTestKeys = {
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_example",
      CLERK_SECRET_KEY: "sk_test_example",
    };

    expect(isLiveProductionEnvironment(previewTestKeys)).toBe(false);
    expect(isClerkUiEnabled(previewTestKeys)).toBe(true);
    expect(isClerkConfigured(previewTestKeys)).toBe(true);
  });

  it("treats Vercel Production as live even when NODE_ENV is overridden", () => {
    const vercelProduction = {
      NODE_ENV: "development",
      VERCEL_ENV: "production",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_example",
      CLERK_SECRET_KEY: "sk_test_example",
      DEMO_MODE: "true",
    };

    expect(isLiveProductionEnvironment(vercelProduction)).toBe(true);
    expect(isClerkConfigured(vercelProduction)).toBe(false);
    expect(isDemoModeEnabled(vercelProduction)).toBe(false);
  });

  it("keeps local next start fail-closed when VERCEL_ENV is absent", () => {
    const localProduction = {
      NODE_ENV: "production",
      DEMO_MODE: "true",
    };

    expect(isLiveProductionEnvironment(localProduction)).toBe(true);
    expect(isDemoModeEnabled(localProduction)).toBe(false);
    expect(
      isLiveProductionEnvironment({
        NODE_ENV: "production",
        VERCEL_ENV: "unexpected",
      }),
    ).toBe(true);
  });

  it("only enables dashboard previews when demo mode is explicit", () => {
    expect(isDemoModeEnabled({})).toBe(false);
    expect(isDemoModeEnabled({ DEMO_MODE: "false" })).toBe(false);
    expect(isDemoModeEnabled({ DEMO_MODE: "TRUE" })).toBe(true);
    expect(isDemoModeEnabled({ DEMO_MODE: "on" })).toBe(true);
    expect(
      isDemoModeEnabled({
        NODE_ENV: "production",
        VERCEL_ENV: "preview",
        DEMO_MODE: "true",
      }),
    ).toBe(true);
  });

  it("parses a comma-separated admin allowlist without empty or duplicate IDs", () => {
    expect(
      getAdminUserIds({
        ADMIN_USER_IDS: " user_primary, user_backup, user_primary, , ",
      }),
    ).toEqual(["user_primary", "user_backup"]);
  });

  it("fails closed when checking admin access", () => {
    expect(isAdminUserId("user_primary", {})).toBe(false);
    expect(isAdminUserId(undefined, { ADMIN_USER_IDS: "user_primary" })).toBe(
      false,
    );
    expect(
      isAdminUserId("user_other", { ADMIN_USER_IDS: "user_primary" }),
    ).toBe(false);
    expect(
      isAdminUserId("user_primary", {
        ADMIN_USER_IDS: "user_primary,user_backup",
      }),
    ).toBe(true);
  });
});
