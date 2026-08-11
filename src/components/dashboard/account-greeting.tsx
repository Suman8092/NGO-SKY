"use client";

import { useUser } from "@clerk/nextjs";

export function AccountGreeting({
  role,
  clerkEnabled,
}: {
  role: "admin" | "user";
  clerkEnabled: boolean;
}) {
  if (!clerkEnabled) {
    return role === "admin"
      ? "Operations overview"
      : "Welcome to your account.";
  }

  return <ClerkGreeting role={role} />;
}

function ClerkGreeting({ role }: { role: "admin" | "user" }) {
  const { isLoaded, user } = useUser();
  const firstName = user?.firstName ?? user?.fullName?.split(/\s+/)[0];

  if (!isLoaded || !firstName) {
    return role === "admin"
      ? "Operations overview"
      : "Welcome to your account.";
  }

  return role === "admin"
    ? `Good morning, ${firstName}.`
    : `Welcome to your account, ${firstName}.`;
}
