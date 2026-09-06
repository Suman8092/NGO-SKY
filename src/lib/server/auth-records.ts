import "server-only";

import { clerkClient } from "@clerk/nextjs/server";

import { isAdminUserId, isClerkConfigured } from "@/lib/auth-config";

export type AuthPeopleRead =
  | {
      state: "ready";
      data: {
        totalCount: number;
        people: AuthPersonRecord[];
      };
    }
  | { state: "unavailable"; reason: "auth_not_configured" | "auth_unavailable" };

export type AuthPersonRecord = {
  id: string;
  displayName: string;
  primaryEmail?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  administrator: boolean;
  locked: boolean;
  banned: boolean;
  createdAt: string;
  lastSignInAt?: string;
};

export async function getAdminAuthPeople(limit = 50): Promise<AuthPeopleRead> {
  if (!isClerkConfigured()) {
    return { state: "unavailable", reason: "auth_not_configured" };
  }

  try {
    const client = await clerkClient();
    const result = await client.users.getUserList({
      limit: Math.min(100, Math.max(1, Math.trunc(limit))),
      orderBy: "-created_at",
    });

    return {
      state: "ready",
      data: {
        totalCount: result.totalCount,
        people: result.data.map((user) => {
          const primaryEmail = user.primaryEmailAddress;
          const displayName =
            user.fullName ??
            user.username ??
            primaryEmail?.emailAddress ??
            "Account without a display name";

          return {
            id: user.id,
            displayName,
            primaryEmail: primaryEmail?.emailAddress,
            emailVerified: primaryEmail?.verification?.status === "verified",
            twoFactorEnabled: user.twoFactorEnabled,
            administrator: isAdminUserId(user.id),
            locked: user.locked,
            banned: user.banned,
            createdAt: new Date(user.createdAt).toISOString(),
            lastSignInAt: user.lastSignInAt
              ? new Date(user.lastSignInAt).toISOString()
              : undefined,
          };
        }),
      },
    };
  } catch {
    return { state: "unavailable", reason: "auth_unavailable" };
  }
}
