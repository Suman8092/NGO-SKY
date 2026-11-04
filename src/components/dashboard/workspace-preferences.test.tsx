import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { WorkspacePreferences } from "./workspace-preferences";
const mocks = vi.hoisted(() => ({
  setTheme: vi.fn(),
  openUserProfile: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "system", setTheme: mocks.setTheme }),
}));
vi.mock("@clerk/nextjs", () => ({
  useClerk: () => ({ openUserProfile: mocks.openUserProfile }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));
it("uses the real theme, account-security, and refresh controls", () => {
  render(<WorkspacePreferences />);
  fireEvent.click(screen.getByRole("button", { name: "Dark" }));
  expect(mocks.setTheme).toHaveBeenCalledWith("dark");
  fireEvent.click(
    screen.getByRole("button", { name: "Manage account & security" }),
  );
  expect(mocks.openUserProfile).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole("button", { name: "Refresh status" }));
  expect(mocks.refresh).toHaveBeenCalledOnce();
});
