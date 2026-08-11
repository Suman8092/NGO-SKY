import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  isAdminUserId,
  isClerkConfigured,
  isDemoModeEnabled,
} from "@/lib/auth-config";
import { isEditorialContentPublished } from "@/lib/content-config";

const isDashboardRoute = createRouteMatcher(["/dashboard/:path*"]);
const isAdminRoute = createRouteMatcher(["/admin/:path*"]);
const isEditorialAssetRoute = createRouteMatcher(["/images/:path*"]);
const isEditorialRoute = createRouteMatcher([
  "/about/:path*",
  "/programs/:path*",
  "/campaigns/:path*",
  "/impact/:path*",
  "/stories/:path*",
  "/insights/:path*",
  "/events/:path*",
  "/gallery/:path*",
  "/faq/:path*",
  "/get-involved/:path*",
  "/volunteer/:path*",
  "/search/:path*",
  "/privacy/:path*",
  "/terms/:path*",
  "/accessibility/:path*",
]);
const clerkConfigured = isClerkConfigured();
const demoModeEnabled = isDemoModeEnabled();
const editorialContentPublished = isEditorialContentPublished();

function routeUrl(request: NextRequest, pathname: string): URL {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return url;
}

const protectedMiddleware = clerkMiddleware(
  async (auth, request) => {
    if (!isDashboardRoute(request) && !isAdminRoute(request)) return;

    const { userId } = await auth.protect();

    if (isAdminRoute(request) && !isAdminUserId(userId)) {
      return NextResponse.redirect(routeUrl(request, "/dashboard"));
    }
  },
  {
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
  },
);

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  if (!editorialContentPublished && isEditorialRoute(request)) {
    return NextResponse.rewrite(routeUrl(request, "/content-review"));
  }

  if (!editorialContentPublished && isEditorialAssetRoute(request)) {
    return new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  if (!isDashboardRoute(request) && !isAdminRoute(request)) {
    return NextResponse.next();
  }

  if (clerkConfigured) {
    return protectedMiddleware(request, event);
  }

  if (demoModeEnabled) {
    return isAdminRoute(request)
      ? NextResponse.redirect(routeUrl(request, "/dashboard"))
      : NextResponse.next();
  }

  const signInUrl = routeUrl(request, "/sign-in");
  signInUrl.searchParams.set("reason", "auth-unavailable");
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/about/:path*",
    "/programs/:path*",
    "/campaigns/:path*",
    "/impact/:path*",
    "/stories/:path*",
    "/insights/:path*",
    "/events/:path*",
    "/gallery/:path*",
    "/faq/:path*",
    "/get-involved/:path*",
    "/volunteer/:path*",
    "/search/:path*",
    "/privacy/:path*",
    "/terms/:path*",
    "/accessibility/:path*",
    "/images/:path*",
  ],
};
