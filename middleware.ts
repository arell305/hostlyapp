import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent } from "next/server";
import { api } from "./convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { UserRole } from "./utils/enum";

const isProtectedRoute = createRouteMatcher(["/create-company"]);
const isHostlyAdminProtected = createRouteMatcher(["/admin/app/companies"]);
const isSubscriptionRoute = (req: NextRequest) =>
  /^\/([^/]+)\/app\/subscription(?:\/|$)/.test(req.nextUrl.pathname);

const isStripeRoute = (req: NextRequest) =>
  /^\/([^/]+)\/app\/stripe(?:\/|$)/.test(req.nextUrl.pathname);

const isAppRoute = (req: NextRequest) => {
  return /^\/([^/]+)\/app(?:\/|\/.*)$/.test(req.nextUrl.pathname);
};

const isAddEventRoute = (req: NextRequest) =>
  /^\/([^/]+)\/app\/add-event(?:\/|$)/.test(req.nextUrl.pathname);

export default clerkMiddleware(
  async (auth, req: NextRequest, event: NextFetchEvent) => {
    const url = req.nextUrl;

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

    if (isStripeRoute(req)) {
      await auth.protect((has) => {
        return has({ role: UserRole.Admin });
      });
    }

    if (isHostlyAdminProtected(req)) {
      await auth.protect((has) => {
        return (
          has({ role: UserRole.Hostly_Admin }) ||
          has({ role: UserRole.Hostly_Moderator })
        );
      });
    }

    if (isAddEventRoute(req)) {
      await auth.protect((has) => {
        return (
          has({ role: UserRole.Admin }) ||
          has({ role: UserRole.Manager }) ||
          has({ role: UserRole.Hostly_Admin }) ||
          has({ role: UserRole.Hostly_Moderator })
        );
      });
    }

    if (isSubscriptionRoute(req)) {
      await auth.protect((has) => {
        return (
          has({ role: UserRole.Admin }) ||
          has({ role: UserRole.Hostly_Admin }) ||
          has({ role: UserRole.Hostly_Moderator })
        );
      });
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
            return NextResponse.redirect(new URL("/unauthorized", req.url));
          }

          if (organization.slug === "admin") {
            return NextResponse.redirect(
              new URL(`/${organization.slug}/app/companies`, req.url)
            );
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
  }
);

export const config = {
  matcher: [
    "/((?!_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)", // Skip Next.js internals
    "/(api|trpc)(.*)", // Always run middleware for API routes
  ],
};
