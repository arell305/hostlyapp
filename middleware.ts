import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent } from "next/server";

export default clerkMiddleware(
  async (auth, req: NextRequest, event: NextFetchEvent) => {
    const url = req.nextUrl;
    const hostname = req.headers.get("host")!;
    const searchParams = req.nextUrl.searchParams.toString();
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

    // If it's an API route, skip Clerk middleware and continue
    if (path.startsWith("/api")) {
      return NextResponse.next();
    }

    // Handle the dashboard subdomain specifically
    if (hostname === `dashboard.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
      // Protect the dashboard route, redirect to sign-in if not authenticated
      auth().protect();

      // If authenticated, rewrite to the dashboard route
      return NextResponse.rewrite(
        new URL(`/dashboard${path === "/" ? "" : path}`, req.url)
      );
    }

    // For non-dashboard subdomains or other routes, just proceed
    return NextResponse.next();
  }
);

export const config = {
  matcher: [
    "/((?!_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)", // Skip Next.js internals
    "/(api|trpc)(.*)", // Always run middleware for API routes
  ],
};
