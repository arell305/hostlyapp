import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  if (/^\/[^/]+\/app(\/|$)/.test(req.nextUrl.pathname)) {
    const authObject = await auth();
    if (!authObject.userId) {
      return authObject.redirectToSignIn();
    }
  }
  return NextResponse.next();
});
