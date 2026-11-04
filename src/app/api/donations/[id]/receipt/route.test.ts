import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), user: vi.fn(), find: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth, currentUser: mocks.user }));
vi.mock("@/lib/auth-config", () => ({ isClerkConfigured: () => true, isAdminUserId: () => false }));
vi.mock("@/lib/server/repository", () => ({ findDonation: mocks.find }));
beforeEach(() => { vi.clearAllMocks(); mocks.auth.mockResolvedValue({ userId: "viewer" }); mocks.user.mockResolvedValue({ emailAddresses: [{ emailAddress: "donor@example.org", verification: { status: "unverified" } }] }); mocks.find.mockResolvedValue({ record: { accountUserId: "owner", donor: { email: "donor@example.org" }, status: "pending" } }); });
const params = { params: Promise.resolve({ id: "0123456789abcdef01234567" }) };
describe("private donation receipts", () => {
  it("requires sign-in before reading donation data", async () => {
    mocks.auth.mockResolvedValue({ userId: null });
    const { GET } = await import("./route");
    expect((await GET(new Request("http://localhost/receipt"), params)).status).toBe(401);
    expect(mocks.find).not.toHaveBeenCalled();
  });
  it("rejects a different account", async () => {
    const { GET } = await import("./route");
    expect((await GET(new Request("http://localhost/receipt"), params)).status).toBe(403);
  });
  it("does not accept an unverified matching email for a guest donation", async () => {
    mocks.find.mockResolvedValue({ record: { donor: { email: "donor@example.org" }, status: "paid" } });
    const { GET } = await import("./route");
    expect((await GET(new Request("http://localhost/receipt"), params)).status).toBe(403);
  });
});
