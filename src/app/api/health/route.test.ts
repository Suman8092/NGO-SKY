import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());
const getHealthSnapshot = vi.hoisted(() => vi.fn());
const isAdminUserId = vi.hoisted(() => vi.fn());
const isClerkConfigured = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs/server", () => ({ auth }));
vi.mock("@/lib/auth-config", () => ({ isAdminUserId, isClerkConfigured }));
vi.mock("@/lib/server/services/health", () => ({ getHealthSnapshot }));

describe("health route envelope", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ userId: null });
    isAdminUserId.mockReturnValue(false);
    isClerkConfigured.mockReturnValue(false);
  });

  it("keeps shallow liveness public without running provider probes", async () => {
    getHealthSnapshot.mockResolvedValue({
      httpStatus: 200,
      body: {
        status: "ok",
        service: "skymeredian-foundation-api",
        timestamp: "2026-08-11T12:00:00.000Z",
        integrations: { database: "configured" },
        configuration: { invalidFields: ["PRIVATE_CONFIG_NAME"] },
      },
    });
    const { GET } = await import("./route");

    const response = await GET(
      new Request("https://example.org/api/health", {
        headers: { "x-request-id": "request-health-public" },
      }),
    );

    expect(response.status).toBe(200);
    expect(getHealthSnapshot).toHaveBeenCalledWith(false);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        status: "ok",
        service: "skymeredian-foundation-api",
        timestamp: "2026-08-11T12:00:00.000Z",
      },
    });
  });

  it("does not expose deep diagnostics when Clerk is unavailable", async () => {
    const { GET } = await import("./route");

    const response = await GET(
      new Request("https://example.org/api/health?deep=true", {
        headers: { "x-request-id": "request-health-no-auth" },
      }),
    );

    expect(response.status).toBe(404);
    expect(auth).not.toHaveBeenCalled();
    expect(getHealthSnapshot).not.toHaveBeenCalled();
  });

  it("rejects a non-admin deep diagnostic request", async () => {
    isClerkConfigured.mockReturnValue(true);
    auth.mockResolvedValue({ userId: "user_member" });
    const { GET } = await import("./route");

    const response = await GET(
      new Request("https://example.org/api/health?deep=true", {
        headers: { "x-request-id": "request-health-member" },
      }),
    );

    expect(response.status).toBe(403);
    expect(getHealthSnapshot).not.toHaveBeenCalled();
  });

  it("does not label an unhealthy 503 response as successful", async () => {
    isClerkConfigured.mockReturnValue(true);
    auth.mockResolvedValue({ userId: "user_admin" });
    isAdminUserId.mockReturnValue(true);
    getHealthSnapshot.mockResolvedValue({
      httpStatus: 503,
      body: { status: "unhealthy", integrations: { database: "unavailable" } },
    });
    const { GET } = await import("./route");

    const response = await GET(
      new Request("https://example.org/api/health?deep=true", {
        headers: { "x-request-id": "request-health-test" },
      }),
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toContain("no-store");
    await expect(response.json()).resolves.toEqual({
      ok: false,
      data: {
        status: "unhealthy",
        integrations: { database: "unavailable" },
      },
    });
  });
});
