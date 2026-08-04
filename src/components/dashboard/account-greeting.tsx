"use client";

import { useUser } from "@clerk/nextjs";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function AccountGreeting({ role }: { role: "admin" | "user" }) {
  if (!clerkEnabled) {
    return role === "admin" ? "Good morning." : "Your generosity keeps showing up.";
  }

  return <ClerkGreeting role={role} />;
}

function ClerkGreeting({ role }: { role: "admin" | "user" }) {
  const { isLoaded, user } = useUser();
  const firstName = user?.firstName ?? user?.fullName?.split(/\s+/)[0];

  if (!isLoaded || !firstName) {
    return role === "admin" ? "Good morning." : "Your generosity keeps showing up.";
  }

  return role === "admin"
    ? `Good morning, ${firstName}.`
    : `${firstName}, your generosity keeps showing up.`;
}
