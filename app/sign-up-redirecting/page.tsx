"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useOrganizationList } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { UserRole, ResponseStatus } from "@/types/enums";
import NProgress from "nprogress";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import MessagePage from "@/components/shared/shared-page/MessagePage";

/**
 * Tuning
 * - MAX_POLLS: how many times to retry when org isn't ready or query errors transiently
 * - BASE_INTERVAL: initial delay between polls (ms)
 * - BACKOFF: multiplicative backoff per attempt
 */
const MAX_POLLS = 12; // ~ up to ~20s with backoff below
const BASE_INTERVAL = 1000; // 1s
const BACKOFF = 1.4; // 1.0 = linear; >1 = exponential-ish

export default function RedirectingSignUpPage() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const { setActive, isLoaded: orgListLoaded } = useOrganizationList();

  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<number>(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didRouteRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(false);

  const role =
    (user?.publicMetadata?.role as UserRole | undefined) ?? undefined;

  // Convex: mirror org lookup by Clerk user id
  const organizationResponse = useQuery(
    api.organizations.getOrganizationByClerkUserId,
    user ? { clerkUserId: user.id } : "skip"
  );

  // Helpers
  const scheduleRetry = () => {
    if (attempt >= MAX_POLLS) return;
    const delay = Math.floor(BASE_INTERVAL * Math.pow(BACKOFF, attempt));
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setAttempt((a) => a + 1);
    }, delay);
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const go = async () => {
      if (didRouteRef.current) return;

      // Wait for Clerk + org list + Convex query to be *ready* (not undefined)
      if (!userLoaded || !orgListLoaded || organizationResponse === undefined)
        return;

      // If not signed in, just show a friendly error (we're on a post-signup path)
      if (!user) {
        setError("User not found. Please sign in again.");
        return;
      }

      // Handle Convex query outcomes
      if (organizationResponse.status === ResponseStatus.ERROR) {
        // Treat as transient first; retry a few times
        if (attempt < MAX_POLLS) {
          scheduleRetry();
          return;
        }
        setError(organizationResponse.error || "Failed to fetch organization.");
        return;
      }

      const orgData = organizationResponse.data?.organization ?? null;

      // No org yet — give backend time to mirror after invite acceptance
      if (!orgData) {
        if (role === UserRole.Admin) {
          // App-level Admin with no org yet → go create one
          NProgress.start();
          didRouteRef.current = true;
          router.push("/create-company");
          return;
        }

        if (attempt < MAX_POLLS) {
          scheduleRetry();
          return;
        }

        setError("No organization found. Please contact support.");
        return;
      }

      // We have org data — try to set active org in Clerk (best-effort)
      try {
        await setActive({ organization: orgData.clerkOrganizationId });
      } catch {
        // Non-fatal: proceed anyway
        // Optionally you could show a toast in your app shell later
      }

      NProgress.start();
      didRouteRef.current = true;

      if (
        role === UserRole.Hostly_Admin ||
        role === UserRole.Hostly_Moderator
      ) {
        router.push(`/${orgData.slug}/app/companies`);
      } else {
        router.push(`/${orgData.slug}/app`);
      }
    };

    if (!error) void go();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    userLoaded,
    orgListLoaded,
    organizationResponse,
    setActive,
    router,
    role,
    attempt,
    error,
  ]);

  if (error) {
    return (
      <MessagePage
        title="Redirect Error"
        description={error}
        buttonLabel="Home"
        onButtonClick={() => router.push("/")}
      />
    );
  }

  return <FullLoading />;
}
