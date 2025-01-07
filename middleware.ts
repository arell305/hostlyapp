import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { api } from "./convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { canCreateEvents } from "./utils/helpers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ClerkPermissionsEnum } from "@/types/enums";
import { getOrganizationByClerkId } from "./convex/organizations";

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
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

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

    if (path.startsWith("/favicon_io")) {
      return NextResponse.next();
    }

    // If it's an API route, skip Clerk middleware and continue
    if (path.startsWith("/api")) {
      return NextResponse.next();
    }

    if (path === "/") {
      if (auth().userId && !auth().orgId) {
        const createCompanyUrl = new URL("/create-company", req.url);
        return NextResponse.redirect(createCompanyUrl);
      }
      if (auth().userId && auth().orgId) {
        try {
          // Fetch the organization from Convex using the orgId
          const organization = await convex.query(
            api.organizations.getOrganizationByClerkId,
            {
              clerkOrganizationId: auth().orgId || "",
            }
          );

          if (organization) {
            // Redirect to the organization's app route using the company name
            const companyName = organization.name;
            const redirectUrl = new URL(`/${companyName}/app`, req.url);
            return NextResponse.redirect(redirectUrl);
          }
        } catch (error) {
          console.error("Error fetching organization:", error);
          // Optionally handle the error or continue with normal flow
        }
      }
    }
    // Avoid redirect loop for the "/create-company" route

    return NextResponse.next();

    // Handle the dashboard subdomain specifically
    // if (hostname === `signInFallbackRedirectUrl.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
    //   // Protect the dashboard route, redirect to sign-in if not authenticated

    //   auth().protect();
    //   if (isCreateEventRoute(req)) {
    //     if (
    //       !auth().has({ permission: ClerkPermissionsEnum.ORG_EVENTS_CREATE })
    //     ) {
    //       return NextResponse.redirect(new URL("/unauthorized", req.url));
    //     }
    //   }

    //   if (isEntireGuestListRoute(req)) {
    //     if (
    //       !auth().has({
    //         permission: ClerkPermissionsEnum.ORG_EVENTS_VIEW_ALL_GUESTLIST,
    //       })
    //     ) {
    //       return NextResponse.redirect(new URL("/unauthorized", req.url));
    //     }
    //   }
    //   // If authenticated, rewrite to the dashboard route
    //   return NextResponse.rewrite(
    //     new URL(`/dashboard${path === "/" ? "" : path}`, req.url)
    //   );
    // }

    // For non-dashboard subdomains or other routes, just proceed
  }
);

export const config = {
  matcher: [
    "/((?!_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)", // Skip Next.js internals
    "/(api|trpc)(.*)", // Always run middleware for API routes
  ],
};
