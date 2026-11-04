import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardSidebar } from "./dashboard-sidebar";
vi.mock("next/navigation", () => ({ usePathname: () => "/admin/settings" }));
vi.mock("@clerk/nextjs", () => ({
  SignOutButton: ({ children }: { children: React.ReactNode }) => children,
  useUser: () => ({ isLoaded: true, user: null }),
}));
vi.mock("@/components/brand-mark", () => ({
  BrandMark: () => <span>Foundation</span>,
}));
vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <button>Theme</button>,
}));
afterEach(cleanup);
describe("workspace navigation", () => {
  it("keeps Settings outside scrolling navigation and exposes admin sections", () => {
    render(
      <DashboardSidebar
        role="admin"
        clerkEnabled={false}
        editorialContentPublished
      />,
    );
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/admin/settings",
    );
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      within(
        screen.getByRole("navigation", { name: "Dashboard navigation" }),
      ).queryByRole("link", { name: "Settings" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Donations" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Analytics" })).toBeInTheDocument();
  });
  it("shows the admin entry only when the server grants administrator access", () => {
    const view = render(
      <DashboardSidebar
        role="user"
        clerkEnabled={false}
        editorialContentPublished
      />,
    );
    expect(
      screen.queryByRole("link", { name: "Admin workspace" }),
    ).not.toBeInTheDocument();
    view.rerender(
      <DashboardSidebar
        role="user"
        clerkEnabled={false}
        editorialContentPublished
        adminAccess
      />,
    );
    expect(
      screen.getByRole("link", { name: "Admin workspace" }),
    ).toHaveAttribute("href", "/admin");
  });
});
