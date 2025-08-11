// import { useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useUser, RedirectToSignIn } from "@clerk/nextjs";
// import { useQuery } from "convex/react";
// import { api } from "convex/_generated/api";
// import FullLoading from "@/[slug]/app/components/loading/FullLoading";
// import { UserRole } from "@/types/enums";

// const MAX_WAIT_MS = 20000;

// export default function RedirectingPage() {
//   console.log("RedirectingPage");
//   const router = useRouter();
//   const { user, isLoaded } = useUser();
//   console.log("user", user);
//   const didRouteRef = useRef(false);
//   const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const orgRes = useQuery(
//     api.organizations.getOrganizationByClerkUserId,
//     user ? { clerkUserId: user.id } : "skip"
//   );

//   console.log("orgRes", orgRes);

//   // // 1) If Clerk is loaded and there's no user, let Clerk handle sign-in redirect.
//   // if (isLoaded && !user) return <RedirectToSignIn />;

//   // // 2) Only route once we HAVE a user and the query has resolved (not undefined).
//   useEffect(() => {
//     if (!isLoaded) return; // <-- key: do nothing while signed out
//     if (!user) {
//       return router.replace("/sign-in");
//     }
//     if (orgRes === undefined) return; // wait for Convex query
//     if (didRouteRef.current) return;

//     const org = orgRes?.data?.organization ?? null;

//     didRouteRef.current = true;

//     if (org?.slug === "admin") {
//       router.replace("/admin/app/companies");
//       return;
//     }

//     if (org) {
//       router.replace(`/${org.slug}/app`);
//       return;
//     }

//     const role = user.publicMetadata.role as UserRole | undefined;
//     if (role === UserRole.Admin) {
//       router.replace("/create-company");
//     } else {
//       router.replace("/");
//     }
//   }, [user, orgRes, router]);

//   // // 3) Timeout fallback only when signed in (no bouncing to /sign-in here)
//   useEffect(() => {
//     if (!user || didRouteRef.current) return;

//     if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     timeoutRef.current = setTimeout(() => {
//       if (didRouteRef.current) return;
//       didRouteRef.current = true;

//       const role = user.publicMetadata.role as UserRole | undefined;
//       if (role === UserRole.Admin) {
//         router.replace("/create-company");
//       } else {
//         router.replace("/");
//       }
//     }, MAX_WAIT_MS);

//     return () => {
//       if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     };
//   }, [user, router]);

//   return <FullLoading />;
// }

// app/post-sign-in/page.tsx
// app/post-sign-in/page.tsx
"use server";

import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import { UserRole } from "@/types/enums";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default async function PostSignIn() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/post-sign-in");

  // Get Clerk user to read publicMetadata with proper typing
  const user = await currentUser();
  const role =
    (user?.publicMetadata?.role as UserRole | undefined) ?? undefined;

  const res = await convex.query(
    api.organizations.getOrganizationByClerkUserId,
    {
      clerkUserId: userId,
    }
  );

  const org = res?.data?.organization ?? null;

  if (org?.slug === "admin") redirect("/admin/app/companies");
  if (org) redirect(`/${org.slug}/app`);
  if (role === UserRole.Admin) redirect("/create-company");

  redirect("/");
}
