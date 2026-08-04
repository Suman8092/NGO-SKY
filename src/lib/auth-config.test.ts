import { describe, expect, it } from "vitest";

import { isClerkConfigured, isDemoModeEnabled } from "./auth-config";

describe("authentication configuration", () => {
  it("requires a matching Clerk key pair to enable authentication", () => {
    expect(
      isClerkConfigured({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_example",
        CLERK_SECRET_KEY: "sk_test_example",
      }),
    ).toBe(true);
    expect(isClerkConfigured({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_example" })).toBe(
      false,
    );
    expect(isClerkConfigured({ CLERK_SECRET_KEY: "sk_test_example" })).toBe(false);
  });

  it("only enables dashboard previews when demo mode is explicit", () => {
    expect(isDemoModeEnabled({})).toBe(false);
    expect(isDemoModeEnabled({ DEMO_MODE: "false" })).toBe(false);
    expect(isDemoModeEnabled({ DEMO_MODE: "TRUE" })).toBe(true);
    expect(isDemoModeEnabled({ DEMO_MODE: "on" })).toBe(true);
  });
});
