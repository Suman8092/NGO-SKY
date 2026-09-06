import { afterEach, describe, expect, it, vi } from "vitest";

const getUserList = vi.hoisted(() => vi.fn());
const clerkClient = vi.hoisted(() =>
  vi.fn(async () => ({ users: { getUserList } })),
);

vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({ clerkClient }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("administrator identity reads", () => {
  it("fails closed when Clerk is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "");
    vi.stubEnv("CLERK_SECRET_KEY", "");
    const { getAdminAuthPeople } = await import("./auth-records");

    await expect(getAdminAuthPeople()).resolves.toEqual({
      state: "unavailable",
      reason: "auth_not_configured",
    });
    expect(clerkClient).not.toHaveBeenCalled();
  });

  it("returns bounded account metadata without passwords or secrets", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_example");
    vi.stubEnv("CLERK_SECRET_KEY", "sk_test_example");
    vi.stubEnv("ADMIN_USER_IDS", "user_admin");
    getUserList.mockResolvedValue({
      totalCount: 1,
      data: [
        {
          id: "user_admin",
          fullName: "Verified Operator",
          username: "operator",
          primaryEmailAddress: {
            emailAddress: "operator@example.org",
            verification: { status: "verified" },
          },
          twoFactorEnabled: true,
          locked: false,
          banned: false,
          createdAt: Date.parse("2026-08-01T00:00:00.000Z"),
          lastSignInAt: Date.parse("2026-08-02T00:00:00.000Z"),
          passwordEnabled: true,
        },
      ],
    });
    const { getAdminAuthPeople } = await import("./auth-records");

    const result = await getAdminAuthPeople(500);

    expect(getUserList).toHaveBeenCalledWith({
      limit: 100,
      orderBy: "-created_at",
    });
    expect(result).toEqual({
      state: "ready",
      data: {
        totalCount: 1,
        people: [
          {
            id: "user_admin",
            displayName: "Verified Operator",
            primaryEmail: "operator@example.org",
            emailVerified: true,
            twoFactorEnabled: true,
            administrator: true,
            locked: false,
            banned: false,
            createdAt: "2026-08-01T00:00:00.000Z",
            lastSignInAt: "2026-08-02T00:00:00.000Z",
          },
        ],
      },
    });
    expect(JSON.stringify(result)).not.toContain("password");
  });

  it("does not expose provider failures", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_example");
    vi.stubEnv("CLERK_SECRET_KEY", "sk_test_example");
    clerkClient.mockRejectedValueOnce(new Error("provider secret detail"));
    const { getAdminAuthPeople } = await import("./auth-records");

    await expect(getAdminAuthPeople()).resolves.toEqual({
      state: "unavailable",
      reason: "auth_unavailable",
    });
  });
});
