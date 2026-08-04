import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard/:path*", "/admin/:path*"]);
const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

const protectedMiddleware = clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) await auth.protect();
}, {
  signInUrl: "/sign-in",
  signUpUrl: "/sign-up",
});

export default clerkConfigured
  ? protectedMiddleware
  : function demoMiddleware() {
      return NextResponse.next();
    };

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
