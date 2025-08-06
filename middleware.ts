import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextFetchEvent } from "next/server";

const isAppRoute = (req: NextRequest) => {
  return /^\/([^/]+)\/app(?:\/|\/.*)$/.test(req.nextUrl.pathname);
};

export default clerkMiddleware(
  async (auth, req: NextRequest, event: NextFetchEvent) => {
    const url = req.nextUrl;

    const searchParams = req.nextUrl.searchParams.toString();
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

    const { userId, sessionClaims } = await auth();
    const orgId = sessionClaims?.orgId;

    if (path === "/") {
      if (userId) {
        return NextResponse.redirect(new URL("/redirecting", req.url));
      }
    }

    if (isAppRoute(req)) {
      const match = url.pathname.match(/^\/([^/]+)\/app(?:\/|$)/);
      const slug = match ? match[1] : null;

      if (!slug) return NextResponse.next();

      if (!userId) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }
      if (!orgId) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  }
);

export const config = {
  matcher: [
    "/((?!_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)", // Skip Next.js internals
    "/(api|trpc)(.*)", // Always run middleware for API routes
  ],
};
