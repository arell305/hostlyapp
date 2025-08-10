// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useUser, useOrganizationList, useOrganization } from "@clerk/nextjs";
// import FullLoading from "@/[slug]/app/components/loading/FullLoading";
// import { api } from "convex/_generated/api";
// import { useQuery } from "convex/react";
// import { ResponseStatus, UserRole } from "@/types/enums";
// import NProgress from "nprogress";
// import { RedirectToSignIn } from "@clerk/nextjs";
// import MessagePage from "@/components/shared/shared-page/MessagePage";

// const MAX_POLLS = 6;
// const POLL_INTERVAL = 500; // ms
// const MAX_WAIT_TIME = 10000; // 10 seconds

// const RedirectingPage = () => {
//   const router = useRouter();
//   const { user, isLoaded: userLoaded } = useUser();
//   const { setActive, isLoaded: organizationListLoaded } = useOrganizationList();
//   const { organization, isLoaded: organizationLoaded } = useOrganization();

//   // Change error to string | null
//   const [error, setError] = useState<string | null>(null);
//   const [pollCount, setPollCount] = useState(0);

//   // Skip query if user not loaded
//   const organizationResponse = useQuery(
//     api.organizations.getOrganizationByClerkUserId,
//     user ? { clerkUserId: user.id } : "skip"
//   );

//   // Timeout fallback (optional but robust)
//   useEffect(() => {
//     const timeout = setTimeout(
//       () => setError("Request timed out. Please try again later."),
//       MAX_WAIT_TIME
//     );
//     return () => clearTimeout(timeout);
//   }, []);

//   useEffect(() => {
//     const redirect = async () => {
//       if (!userLoaded || !organizationLoaded || !organizationListLoaded) return;

//       if (userLoaded && !user) {
//         return <RedirectToSignIn />;
//       }

//       if (organizationResponse === undefined) {
//         return;
//       }

//       if (organizationResponse.status === ResponseStatus.ERROR) {
//         setError("Failed to load your organization. Please contact support.");
//         return;
//       }

//       const { organization: orgData } = organizationResponse.data;
//       const orgRole = user?.publicMetadata.role as string;

//       console.log("orgData", orgData);
//       console.log("orgRole", orgRole);

//       if (!orgData && orgRole === UserRole.Admin) {
//         NProgress.start();
//         router.push("/create-company");
//         return;
//       }

//       if (!orgData && pollCount < MAX_POLLS) {
//         setTimeout(() => setPollCount((c) => c + 1), POLL_INTERVAL);
//         return;
//       }

//       if (!orgData && pollCount >= MAX_POLLS) {
//         setError(
//           "Could not find your organization. Please check your account or contact support."
//         );
//         return;
//       }

//       if (!orgData) {
//         setError("You do not belong to any organization.");
//         return;
//       }

//       if (!organization || organization.id !== orgData.clerkOrganizationId) {
//         try {
//           await setActive({ organization: orgData.clerkOrganizationId });
//           setTimeout(() => {
//             router.refresh();
//           }, 200); // 200ms delay to allow Clerk context to update
//         } catch (err) {
//           setError("Failed to set active organization. Please try again.");
//         }
//         return;
//       }

//       NProgress.start();
//       if (
//         orgRole === UserRole.Hostly_Admin ||
//         orgRole === UserRole.Hostly_Moderator
//       ) {
//         router.push(`/${orgData.slug}/app/companies`);
//       } else {
//         router.push(`/${orgData.slug}/app`);
//       }
//     };

//     if (!error) {
//       redirect();
//     }
//   }, [
//     user,
//     userLoaded,
//     organizationLoaded,
//     organizationResponse,
//     setActive,
//     organization,
//     router,
//     pollCount,
//     error, // prevent redirect after error
//     organizationListLoaded,
//   ]);

//   if (error) {
//     return (
//       <MessagePage
//         title="Error"
//         description={error}
//         buttonLabel="Home"
//         onButtonClick={() => router.push("/")}
//       />
//     );
//   }

//   return <FullLoading />;
// };

// export default RedirectingPage;

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useUser,
  useOrganizationList,
  useOrganization,
  RedirectToSignIn,
} from "@clerk/nextjs";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { ResponseStatus, UserRole } from "@/types/enums";
import NProgress from "nprogress";
import MessagePage from "@/components/shared/shared-page/MessagePage";

const MAX_WAIT_MS = 20000; // be generous for invite accept propagation
const SET_ACTIVE_RETRIES = 8;
const SET_ACTIVE_DELAY_MS = 400;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const RedirectingPage = () => {
  const router = useRouter();

  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: organizationLoaded } = useOrganization();
  const { setActive, isLoaded: organizationListLoaded } = useOrganizationList();

  const [error, setError] = useState<string | null>(null);
  const startedAtRef = useRef<number | null>(null);

  // Convex: find org record tied to this user (may lag right after invite)
  const organizationResponse = useQuery(
    api.organizations.getOrganizationByClerkUserId,
    user ? { clerkUserId: user.id } : "skip"
  );

  // Track timeout window
  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  // Early return if not signed in (needs to be outside effects)
  if (userLoaded && !user) {
    return <RedirectToSignIn />;
  }

  // Loading gate: wait until Clerk primitives load
  const stillLoadingClerk =
    !userLoaded || !organizationLoaded || !organizationListLoaded;

  // DB org extracted when ready (and not error)
  const dbStatus = organizationResponse?.status;
  const dbOrg =
    organizationResponse && dbStatus === ResponseStatus.SUCCESS
      ? organizationResponse.data.organization
      : null;

  const orgRole = user?.publicMetadata.role as string as UserRole | undefined;

  // Decide target slug and route once we know the org
  const computeDestination = useMemo(() => {
    if (!dbOrg) return null;
    const base = `/${dbOrg.slug}/app`;
    if (
      orgRole === UserRole.Hostly_Admin ||
      orgRole === UserRole.Hostly_Moderator
    ) {
      return `${base}/companies`;
    }
    return base;
  }, [dbOrg, orgRole]);

  useEffect(() => {
    let cancelled = false;

    const attemptRedirect = async () => {
      if (stillLoadingClerk) return; // wait for Clerk basics

      // If Convex query errored, only show error if we’re beyond the wait window.
      if (dbStatus === ResponseStatus.ERROR) {
        const elapsed = Date.now() - (startedAtRef.current ?? Date.now());
        if (elapsed > MAX_WAIT_MS) {
          if (!cancelled)
            setError(
              "Failed to load your organization. Please contact support."
            );
        }
        return;
      }

      // If we *do* have a DB org, ensure Clerk's active org matches it.
      if (dbOrg) {
        if (!organization || organization.id !== dbOrg.clerkOrganizationId) {
          // Retry setActive a few times; this often races right after invite accept
          for (let i = 0; i < SET_ACTIVE_RETRIES; i++) {
            try {
              await setActive({ organization: dbOrg.clerkOrganizationId });
              // give Clerk context a tick to settle
              await sleep(200);
              break;
            } catch {
              await sleep(SET_ACTIVE_DELAY_MS);
            }
          }
        }

        // Navigate once Clerk org is active (or we tried our best anyway)
        NProgress.start();
        router.replace(computeDestination!);
        return;
      }

      // No DB org yet.
      // 1) If user is Admin in our app, send them to create-company.
      if (orgRole === UserRole.Admin) {
        NProgress.start();
        router.replace("/create-company");
        return;
      }

      // 2) If Clerk already shows an active org (common right after invite),
      //    keep trying to let backend catch up before erroring.
      if (organization?.id) {
        const elapsed = Date.now() - (startedAtRef.current ?? Date.now());
        if (elapsed < MAX_WAIT_MS) {
          // give backend time, then re-run effect
          await sleep(400);
          if (!cancelled) {
            // trigger another render cycle naturally; nothing else needed
          }
          return;
        }

        // Timed out waiting for backend org record
        if (!cancelled) {
          setError(
            "Your organization is being set up. Please refresh in a moment or contact support if this persists."
          );
        }
        return;
      }

      // 3) No DB org and Clerk has none active:
      //    Try not to throw a hard error immediately; give it some time.
      const elapsed = Date.now() - (startedAtRef.current ?? Date.now());
      if (elapsed < MAX_WAIT_MS) {
        await sleep(400);
        if (!cancelled) {
          // loop again
        }
        return;
      }

      if (!cancelled) {
        setError(
          "Could not find your organization. Please check your account or contact support."
        );
      }
    };

    attemptRedirect();

    return () => {
      cancelled = true;
    };
  }, [
    stillLoadingClerk,
    dbOrg,
    dbStatus,
    organization,
    orgRole,
    router,
    setActive,
    computeDestination,
  ]);

  if (error) {
    return (
      <MessagePage
        title="We’re almost there"
        description={error}
        buttonLabel="Home"
        onButtonClick={() => router.push("/")}
      />
    );
  }

  // While we’re waiting for Clerk + Convex to converge, keep a clean loader.
  return <FullLoading />;
};

export default RedirectingPage;
