import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

import { isClerkConfigured, isDemoModeEnabled } from "@/lib/auth-config";

const isProtectedRoute = createRouteMatcher(["/dashboard/:path*", "/admin/:path*"]);
const clerkConfigured = isClerkConfigured();
const demoModeEnabled = isDemoModeEnabled();

const protectedMiddleware = clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) await auth.protect();
}, {
  signInUrl: "/sign-in",
  signUpUrl: "/sign-up",
});

export default clerkConfigured
  ? protectedMiddleware
  : demoModeEnabled
    ? function demoMiddleware() {
        return NextResponse.next();
      }
    : function unavailableMiddleware(request: NextRequest) {
        const signInUrl = new URL("/sign-in", request.url);
        signInUrl.searchParams.set("reason", "auth-unavailable");
        return NextResponse.redirect(signInUrl);
      };

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
