import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ configured: false, admin: false, auth: vi.fn(), update: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));
vi.mock("@/lib/auth-config", () => ({ isClerkConfigured: () => mocks.configured, isAdminUserId: () => mocks.admin }));
vi.mock("@/lib/server/operations", () => ({ updateVolunteerStatus: mocks.update, updateContactStatus: mocks.update }));
vi.mock("@/lib/server/cms/sanity-cache", () => ({ fetchCachedPublishedContent: vi.fn() }));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

beforeEach(() => { vi.clearAllMocks(); mocks.configured = false; mocks.admin = false; mocks.auth.mockResolvedValue({ userId: "user_1" }); });
describe("admin mutation authorization", () => {
  it("denies writes when authentication is missing", async () => {
    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost/api/admin/operations", { method: "POST", body: JSON.stringify({ action: "update_contact_status", id: "abc", status: "resolved" }) }));
    expect(response.status).toBe(403);
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("denies authenticated non-administrators", async () => {
    mocks.configured = true;
    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost/api/admin/operations", { method: "POST", body: "{}" }));
    expect(response.status).toBe(403);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
