"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useOrganizationList } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { UserRole } from "@/types/enums";
import NProgress from "nprogress";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import MessagePage from "@/components/shared/shared-page/MessagePage";

const MAX_POLLS = 12;
const BASE_INTERVAL = 1000;
const BACKOFF = 1.4;

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

  const organizationResponse = useQuery(
    api.organizations.getOrganizationByClerkUserId,
    user ? { clerkUserId: user.id } : "skip"
  );

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

      if (!userLoaded || !orgListLoaded || organizationResponse === undefined)
        return;

      if (!user) {
        setError("User not found. Please sign in again.");
        return;
      }

      if (!organizationResponse) {
        if (attempt < MAX_POLLS) {
          scheduleRetry();
          return;
        }
        return;
      }

      const orgData = organizationResponse ?? null;

      if (!orgData) {
        if (role === UserRole.Admin) {
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

      try {
        await setActive({ organization: orgData.clerkOrganizationId });
      } catch {}

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
