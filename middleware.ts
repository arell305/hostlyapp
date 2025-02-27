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
import { UserRole } from "./utils/enum";

const isProtectedRoute = createRouteMatcher(["/create-company"]);

const isAppRoute = (req: NextRequest) => {
  return /^\/([^/]+)\/app(?:\/|\/.*)$/.test(req.nextUrl.pathname);
};

export default clerkMiddleware(
  async (auth, req: NextRequest, event: NextFetchEvent) => {
    const url = req.nextUrl;
    const pathSegments = url.pathname.split("/");
    const slug = pathSegments[1];

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
      const { userId, orgId } = await auth();

      // user creates a company if they don't belong to org
      if (userId && !orgId) {
        return NextResponse.redirect(new URL("/create-company", req.url));
      }

      if (userId && orgId) {
        try {
          const organization = await convex.query(
            api.organizations.getOrganizationByClerkId,
            {
              clerkOrganizationId: orgId,
            }
          );

          // unauthorize if organization is not
          if (!organization || !organization.isActive) {
            return NextResponse.redirect("/unauthorized");
          }

          if (organization) {
            return NextResponse.redirect(
              new URL(`/${organization.slug}/app`, req.url)
            );
          }
        } catch (error) {
          console.error("Error fetching organization:", error);
        }
      }
    }

    if (isProtectedRoute(req)) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }
    }

    if (isAppRoute(req)) {
      const match = url.pathname.match(/^\/([^/]+)\/app(?:\/|$)/);
      const slug = match ? match[1] : null;

      if (!slug) return NextResponse.next();

      const { userId, orgId } = await auth();

      if (!userId) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }

      if (!orgId) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      const organization = await convex.query(
        api.organizations.getOrganizationByClerkId,
        {
          clerkOrganizationId: orgId,
        }
      );

      // unauthorize if organization is not
      if (!organization || !organization.isActive) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      if (organization.slug === slug) {
        return NextResponse.next();
      }

      const user = await convex.query(api.users.findUserByClerkId, {
        clerkUserId: userId,
      });

      if (
        user.data?.user.role === UserRole.Hostly_Admin ||
        user.data?.user.role === UserRole.Hostly_Moderator
      ) {
        return NextResponse.next();
      }

      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

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
