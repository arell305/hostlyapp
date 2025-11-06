import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isHostlyUser } from "./shared/utils/permissions";

function extractOrgSlug(pathname: string): string | null {
  const match = pathname.match(/^\/([^/]+)\/app(?:\/|$)/);
  return match ? match[1] : null;
}

export default clerkMiddleware(async (auth, req) => {
  const user = await auth();
  const { pathname } = req.nextUrl;

  if (pathname === "/" && user.userId) {
    if (user.orgSlug) {
      return NextResponse.redirect(new URL(`/${user.orgSlug}/app`, req.url));
    }
    return NextResponse.redirect(new URL("/redirecting", req.url));
  }

  const orgSlugFromUrl = extractOrgSlug(pathname);

  if (orgSlugFromUrl) {
    if (!user.userId) {
      return user.redirectToSignIn();
    }

    const isSuper = isHostlyUser(user.orgRole);

    if (!isSuper && user.orgSlug !== orgSlugFromUrl) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
