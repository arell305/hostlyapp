import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent } from "next/server";
import {
  isAdmin,
  isAdminOrHostlyAdmin,
  isHostlyUser,
  isManager,
} from "./utils/permissions";

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

    const { userId, sessionClaims } = await auth();
    const userRole = sessionClaims?.userRole;
    const orgId = sessionClaims?.orgId;

    if (path.startsWith("/favicon_io")) {
      return NextResponse.next();
    }

    if (path.startsWith("/api")) {
      return NextResponse.next();
    }

    if (isStripeRoute(req)) {
      const preventAccess = !isAdmin(userRole);
      if (preventAccess) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    if (isHostlyAdminProtected(req)) {
      const preventAccess = !isHostlyUser(userRole);
      if (preventAccess) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      } else {
        return NextResponse.next();
      }
    }

    if (isAddEventRoute(req)) {
      const preventAccess = !isManager(userRole);
      if (preventAccess) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    if (isSubscriptionRoute(req)) {
      const preventAccess = !isAdminOrHostlyAdmin(userRole);
      if (preventAccess) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    if (path === "/") {
      if (userId) {
        return NextResponse.redirect(new URL("/redirecting", req.url));
      }
    }

    if (isProtectedRoute(req)) {
      if (!userId) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
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
      // const organization = await convex.query(
      //   api.organizations.getOrganizationByClerkId,
      //   {
      //     clerkOrganizationId: orgId,
      //   }
      // );

      // if (!organization) {
      //   return NextResponse.redirect(new URL("/unauthorized", req.url));
      // }

      // const userSchema = await convex.query(api.users.publicfindUserByClerkId, {
      //   clerkUserId: userId,
      // });

      // if (!userSchema) {
      //   return NextResponse.redirect(new URL("/unauthorized", req.url));
      // }

      // if (!userSchema.isActive) {
      //   if (!url.pathname.includes("account-not-found")) {
      //     return NextResponse.redirect(
      //       new URL(`/${slug}/app/account-not-found`, req.url)
      //     );
      //   }
      // }

      // if (!organization.isActive && userSchema.role === UserRole.Admin) {
      //   if (!url.pathname.includes("reactivate")) {
      //     return NextResponse.redirect(
      //       new URL(`/${slug}/app/reactivate`, req.url)
      //     );
      //   }
      // }

      // if (!organization.isActive && userSchema.role !== UserRole.Admin) {
      //   if (!url.pathname.includes("deactivated")) {
      //     return NextResponse.redirect(
      //       new URL(`/${slug}/app/deactivated`, req.url)
      //     );
      //   }
      // }

      // if (organization.slug === slug) {
      //   return NextResponse.next();
      // }
      // if (
      //   userSchema.role === UserRole.Hostly_Admin ||
      //   userSchema.role === UserRole.Hostly_Moderator
      // ) {
      //   return NextResponse.next();
      // }

      //   return NextResponse.redirect(new URL("/unauthorized", req.url));
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
