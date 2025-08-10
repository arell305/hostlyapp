"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  PropsWithChildren,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, useOrganization, useOrganizationList } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  ErrorMessages,
  ResponseStatus,
  StripeAccountStatus,
  UserRole,
} from "@/types/enums";
import type { OrganizationSchema, UserWithPromoCode } from "@/types/types";
import type { SubscriptionSchema } from "@/types/schemas-types";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import MessagePage from "@/components/shared/shared-page/MessagePage";
import { isHostlyUser } from "@/utils/permissions";

type OrganizationContextType = {
  organization: OrganizationSchema;
  connectedAccountId: string;
  connectedAccountEnabled: boolean;
  subscription: SubscriptionSchema;
  availableCredits: number;
  user: UserWithPromoCode;
  orgRole?: UserRole;
  cleanSlug: string;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export const OrganizationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const router = useRouter();
  const { slug } = useParams();
  const cleanSlug =
    typeof slug === "string" ? slug.split("?")[0].toLowerCase() : "";

  // --- Hooks: ALWAYS call in the same order ---
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const orgRole = (clerkUser?.publicMetadata.role as UserRole) ?? undefined;

  const { organization: clerkOrg, isLoaded: orgLoaded } = useOrganization();
  const { setActive, isLoaded: orgListLoaded } = useOrganizationList();

  // Query only when signed in (but the hook is always invoked)
  const shouldQueryOrg = !!cleanSlug && isClerkLoaded && !!isSignedIn;
  const orgContext = useQuery(
    api.organizations.getOrganizationContext,
    shouldQueryOrg ? { slug: cleanSlug } : "skip"
  );

  // Refs/state (always called)
  const didRedirectRef = useRef(false);
  const lastLoadedRef = useRef<number>(Date.now());
  const lastSetRef = useRef<string | null>(null);
  const [tookTooLong, setTookTooLong] = useState(false);

  // --- Effects: always declared (guards inside) ---

  // Redirects
  useEffect(() => {
    if (!shouldQueryOrg || didRedirectRef.current) return;
    if (!orgContext) return;

    if (!isSignedIn && isClerkLoaded) {
      didRedirectRef.current = true;
      router.push("/sign-in");
      return;
    }

    if (orgContext.status !== ResponseStatus.SUCCESS) return;

    const org = orgContext.data?.organization as OrganizationSchema | undefined;
    const u = (orgContext.data?.user as UserWithPromoCode | null) ?? null;
    const isHostlyModerator =
      orgRole === UserRole.Hostly_Moderator ||
      orgRole === UserRole.Hostly_Admin;

    if (!u) {
      didRedirectRef.current = true;
      router.push("/sign-in");
      return;
    }

    if (!org) {
      didRedirectRef.current = true;
      router.push("/unauthorized");
      return;
    }

    if (org.slug !== cleanSlug && !isHostlyModerator) {
      didRedirectRef.current = true;
      router.push("/unauthorized");
      return;
    }

    if (!org.isActive) {
      didRedirectRef.current = true;
      if (orgRole === UserRole.Admin)
        router.push(`/${cleanSlug}/app/reactivate`);
      else router.push(`/${cleanSlug}/app/deactivated`);
    }
  }, [
    shouldQueryOrg,
    orgContext,
    cleanSlug,
    orgRole,
    isSignedIn,
    isClerkLoaded,
    router,
  ]);

  // Track last successful load for TTL refresh
  useEffect(() => {
    if (orgContext?.status === ResponseStatus.SUCCESS) {
      lastLoadedRef.current = Date.now();
    }
  }, [orgContext?.status]);

  // Refresh on focus with TTL
  useEffect(() => {
    const TTL = 2 * 60 * 1000; // 2 minutes
    const onFocus = () => {
      if (Date.now() - lastLoadedRef.current > TTL) router.refresh();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") onFocus();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router]);

  // Slow-loading watchdog
  useEffect(() => {
    const id = setTimeout(() => setTookTooLong(true), 8000);
    return () => clearTimeout(id);
  }, []);

  // Set Clerk active org (idempotent & guarded)
  useEffect(() => {
    if (!isClerkLoaded || !isSignedIn) return;
    if (!orgLoaded || !orgListLoaded) return;
    if (orgContext?.status !== ResponseStatus.SUCCESS) return;

    const org = orgContext.data?.organization as OrganizationSchema | undefined;
    if (!org?.clerkOrganizationId || !setActive) return;

    const role =
      (clerkUser?.publicMetadata.role as UserRole | undefined) ?? undefined;
    const isStaff = isHostlyUser(String(role));
    const isAdminSlug = org.slug === "admin";
    if (isAdminSlug && !isStaff) return;

    const expectedId = org.clerkOrganizationId;
    if (clerkOrg?.id === expectedId) return;
    if (lastSetRef.current === expectedId) return;

    setActive({ organization: expectedId })
      .catch(() => {})
      .finally(() => {
        lastSetRef.current = expectedId;
      });
  }, [
    isClerkLoaded,
    isSignedIn,
    orgLoaded,
    orgListLoaded,
    orgContext?.status,
    orgContext?.data?.organization, // triggers when org changes
    clerkOrg?.id,
    setActive,
    clerkUser?.publicMetadata?.role,
  ]);

  // --- Derived data (plain variables) ---
  const ctxUser = (orgContext?.data?.user as UserWithPromoCode | null) ?? null;
  const org = orgContext?.data?.organization as OrganizationSchema | undefined;
  const connectedAccountId = orgContext?.data?.connectedAccountId ?? "";
  const connectedAccountEnabled =
    orgContext?.data?.connectedAccountStatus === StripeAccountStatus.VERIFIED;
  const subscription = orgContext?.data?.subscription as
    | SubscriptionSchema
    | undefined;
  const availableCredits = orgContext?.data?.availableCredits ?? 0;

  const stillLoading = !shouldQueryOrg || orgContext === undefined;

  // --- IMPORTANT: build the value with a hook BEFORE any return ---
  const valueMemo = useMemo<OrganizationContextType | null>(() => {
    if (!org || !subscription || !ctxUser) return null;
    return {
      organization: org,
      connectedAccountId,
      connectedAccountEnabled,
      subscription,
      availableCredits,
      user: ctxUser,
      orgRole,
      cleanSlug,
    };
  }, [
    org,
    subscription,
    ctxUser,
    connectedAccountId,
    connectedAccountEnabled,
    availableCredits,
    orgRole,
    cleanSlug,
  ]);

  // --- Safe returns AFTER all hooks ---

  if (isClerkLoaded && !isSignedIn) {
    return (
      <MessagePage
        title="Please sign in"
        description="Your session expired. Sign in to continue."
        buttonLabel="Sign in"
        onButtonClick={() => router.push("/sign-in")}
      />
    );
  }

  if (stillLoading) {
    return tookTooLong ? (
      <MessagePage
        title="Reconnecting…"
        description="We are refreshing your session. If this takes too long, try reloading."
        buttonLabel="Retry"
        onButtonClick={() => router.refresh()}
      />
    ) : (
      <FullLoading />
    );
  }

  if (orgContext?.status === ResponseStatus.ERROR) {
    return (
      <MessagePage
        title="Failed to load organization"
        description={orgContext.error || "Please try again."}
        buttonLabel="Retry"
        onButtonClick={() => router.refresh()}
      />
    );
  }

  if (!org) {
    return (
      <MessagePage
        title="Organization not found"
        description="We couldn’t find this organization."
      />
    );
  }

  if (!valueMemo) {
    return (
      <MessagePage
        title="Incomplete data"
        description="Required account info is missing. Please contact support."
      />
    );
  }

  return (
    <OrganizationContext.Provider value={valueMemo}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useContextOrganization = () => {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error(ErrorMessages.CONTEXT_ORGANIZATION_PROVER);
  return ctx;
};
