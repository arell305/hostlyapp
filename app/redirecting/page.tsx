// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   useUser,
//   useOrganizationList,
//   useOrganization,
//   RedirectToSignIn,
// } from "@clerk/nextjs";
// import FullLoading from "@/[slug]/app/components/loading/FullLoading";
// import { api } from "convex/_generated/api";
// import { useQuery } from "convex/react";
// import { ResponseStatus, UserRole } from "@/types/enums";
// import NProgress from "nprogress";
// import MessagePage from "@/components/shared/shared-page/MessagePage";

// const MAX_WAIT_MS = 20000; // generous for invite accept propagation
// const SET_ACTIVE_RETRIES = 8;
// const SET_ACTIVE_DELAY_MS = 400;

// function sleep(ms: number) {
//   return new Promise((r) => setTimeout(r, ms));
// }

// const RedirectingPage = () => {
//   const router = useRouter();

//   const { user, isLoaded: userLoaded } = useUser();
//   const { organization, isLoaded: organizationLoaded } = useOrganization();
//   const { setActive, isLoaded: organizationListLoaded } = useOrganizationList();

//   const [error, setError] = useState<string | null>(null);
//   const startedAtRef = useRef<number | null>(null);

//   // Convex: find org record tied to this user (may lag right after invite)
//   const organizationResponse = useQuery(
//     api.organizations.getOrganizationByClerkUserId,
//     user ? { clerkUserId: user.id } : "skip"
//   );

//   console.log("user", user);

//   // Track timeout window
//   useEffect(() => {
//     startedAtRef.current = Date.now();
//   }, []);

//   // ---- DO NOT RETURN EARLY BEFORE HOOKS ----
//   const shouldShowSignIn = userLoaded && !user;

//   // Loading gate: wait until Clerk primitives load
//   const stillLoadingClerk =
//     !userLoaded || !organizationLoaded || !organizationListLoaded;

//   // DB org extracted when ready (and not error)
//   const dbStatus = organizationResponse?.status;
//   const dbOrg =
//     organizationResponse && dbStatus === ResponseStatus.SUCCESS
//       ? organizationResponse.data.organization
//       : null;

//   const orgRole =
//     (user?.publicMetadata.role as UserRole | undefined) ?? undefined;

//   // Decide target slug and route once we know the org
//   const computeDestination = useMemo(() => {
//     if (!dbOrg) return null;
//     const base = `/${dbOrg.slug}/app`;
//     if (
//       orgRole === UserRole.Hostly_Admin ||
//       orgRole === UserRole.Hostly_Moderator
//     ) {
//       return `${base}/companies`;
//     }
//     return base;
//   }, [dbOrg, orgRole]);

//   useEffect(() => {
//     let cancelled = false;

//     if (shouldShowSignIn) return; // guard: don't run redirect logic if not signed in

//     const attemptRedirect = async () => {
//       if (stillLoadingClerk) return; // wait for Clerk basics

//       // If Convex query errored, only show error if we’re beyond the wait window.
//       if (dbStatus === ResponseStatus.ERROR) {
//         const elapsed = Date.now() - (startedAtRef.current ?? Date.now());
//         if (elapsed > MAX_WAIT_MS) {
//           if (!cancelled)
//             setError(
//               "Failed to load your organization. Please contact support."
//             );
//         }
//         return;
//       }

//       // If we *do* have a DB org, ensure Clerk's active org matches it.
//       if (dbOrg) {
//         if (!organization || organization.id !== dbOrg.clerkOrganizationId) {
//           // Retry setActive a few times—this often races right after invite accept
//           for (let i = 0; i < SET_ACTIVE_RETRIES; i++) {
//             try {
//               await setActive({ organization: dbOrg.clerkOrganizationId });
//               await sleep(200); // let Clerk context settle
//               break;
//             } catch {
//               await sleep(SET_ACTIVE_DELAY_MS);
//             }
//           }
//         }

//         // Navigate once Clerk org is active (or we tried our best anyway)
//         if (computeDestination) {
//           NProgress.start();
//           router.replace(computeDestination);
//         }
//         return;
//       }

//       // No DB org yet.
//       // 1) If user is Admin in our app, send them to create-company.
//       if (orgRole === UserRole.Admin) {
//         NProgress.start();
//         router.replace("/create-company");
//         return;
//       }

//       // 2) If Clerk already shows an active org (common right after invite),
//       //    keep trying to let backend catch up before erroring.
//       if (organization?.id) {
//         const elapsed = Date.now() - (startedAtRef.current ?? Date.now());
//         if (elapsed < MAX_WAIT_MS) {
//           await sleep(400);
//           if (!cancelled) {
//             // loop naturally
//           }
//           return;
//         }

//         // Timed out waiting for backend org record
//         if (!cancelled) {
//           setError(
//             "Your organization is being set up. Please refresh in a moment or contact support if this persists."
//           );
//         }
//         return;
//       }

//       // 3) No DB org and Clerk has none active:
//       //    Try not to throw a hard error immediately; give it some time.
//       const elapsed = Date.now() - (startedAtRef.current ?? Date.now());
//       if (elapsed < MAX_WAIT_MS) {
//         await sleep(400);
//         if (!cancelled) {
//           // loop again
//         }
//         return;
//       }

//       if (!cancelled) {
//         setError(
//           "Could not find your organization. Please check your account or contact support."
//         );
//       }
//     };

//     attemptRedirect();

//     return () => {
//       cancelled = true;
//     };
//   }, [
//     shouldShowSignIn,
//     stillLoadingClerk,
//     dbOrg,
//     dbStatus,
//     organization,
//     orgRole,
//     router,
//     setActive,
//     computeDestination,
//   ]);

//   // ---- SAFE RETURNS AFTER ALL HOOKS ----
//   if (shouldShowSignIn) {
//     return <RedirectToSignIn />;
//   }

//   if (error) {
//     return (
//       <MessagePage
//         title="We’re almost there"
//         description={error}
//         buttonLabel="Home"
//         onButtonClick={() => router.push("/")}
//       />
//     );
//   }

//   // While we’re waiting for Clerk + Convex to converge, keep a clean loader.
//   return <FullLoading />;
// };

// export default RedirectingPage;

"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import { UserRole } from "@/types/enums";

const MAX_WAIT_MS = 20000; // timeout fallback

export default function RedirectingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const didRouteRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const orgRes = useQuery(
    api.organizations.getOrganizationByClerkUserId,
    user ? { clerkUserId: user.id } : "skip"
  );

  // Main navigation logic (no setActive here)
  useEffect(() => {
    if (!isLoaded || orgRes === undefined) return; // wait for Clerk + query
    if (didRouteRef.current) return;

    // Not signed in → go to sign-in immediately
    if (!user) {
      didRouteRef.current = true;
      router.replace("/sign-in?redirect_url=/redirecting");
      return;
    }

    const org = orgRes?.data?.organization ?? null;

    if (org) {
      didRouteRef.current = true;
      router.replace(`/${org.slug}/app`); // go to org
      return;
    }

    // No org found: choose fallback
    const role = user.publicMetadata.role as UserRole | undefined;
    didRouteRef.current = true;
    if (role === UserRole.Admin) {
      router.replace("/create-company");
    } else {
      router.replace("/");
    }
  }, [isLoaded, user, orgRes, router]);

  // Timeout fallback:
  // If Clerk or the query never resolves, send to sign-in so the user can recover.
  useEffect(() => {
    if (didRouteRef.current) return;

    // Start timer when we mount / whenever deps change
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (didRouteRef.current) return;

      if (!isLoaded || !user) {
        didRouteRef.current = true;
        router.replace("/sign-in?redirect_url=/redirecting");
        return;
      }

      // User is signed in but org lookup still hasn’t resolved—fallback by role
      const role = user.publicMetadata.role as UserRole | undefined;
      didRouteRef.current = true;
      if (role === UserRole.Admin) {
        router.replace("/create-company");
      } else {
        router.replace("/");
      }
    }, MAX_WAIT_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isLoaded, user, router]);

  // If Clerk is loaded and there is no user, render the component fallback (covers SSR cases)
  if (isLoaded && !user) return <RedirectToSignIn />;

  // Otherwise show a loader while we resolve
  return <FullLoading />;
}
