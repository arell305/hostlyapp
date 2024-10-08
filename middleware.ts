import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { api } from "./convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { canCreateEvents } from "./utils/helpers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ClerkPermissionsEnum } from "@/utils/enums";

function isCreateEventRoute(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    return path.startsWith("/add-event");
  } else {
    const host = req.headers.get("host") || "";
    return (
      host.startsWith(`dashboard.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) &&
      path.startsWith("/add-event")
    );
  }
}

const isEntireGuestListRoute = createRouteMatcher(["/events/(.+)/guestlist"]);

export default clerkMiddleware(
  async (auth, req: NextRequest, event: NextFetchEvent) => {
    const url = req.nextUrl;
    const hostname = req.headers.get("host")!;
    const searchParams = req.nextUrl.searchParams.toString();
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;
    const convex = new ConvexHttpClient(
      process.env.NEXT_PUBLIC_CONVEX_URL || ""
    );
    // If it's an API route, skip Clerk middleware and continue
    if (path.startsWith("/api")) {
      return NextResponse.next();
    }

    // Handle the dashboard subdomain specifically
    if (hostname === `dashboard.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
      // Protect the dashboard route, redirect to sign-in if not authenticated

      auth().protect();
      if (isCreateEventRoute(req)) {
        if (
          !auth().has({ permission: ClerkPermissionsEnum.ORG_EVENTS_CREATE })
        ) {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }

      if (isEntireGuestListRoute(req)) {
        if (
          !auth().has({
            permission: ClerkPermissionsEnum.ORG_EVENTS_VIEW_ALL_GUESTLIST,
          })
        ) {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }
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
