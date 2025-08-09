"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  PropsWithChildren,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
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

function useHandleOrgRedirects({
  ready,
  response,
  slug,
  user,
  orgRole,
}: {
  ready: boolean;
  response:
    | { status: ResponseStatus; error?: string | null; data?: any }
    | undefined;
  slug: string;
  user: UserWithPromoCode | null;
  orgRole?: UserRole;
}) {
  const router = useRouter();
  const isHostlyModerator =
    orgRole === UserRole.Hostly_Moderator || orgRole === UserRole.Hostly_Admin;

  useEffect(() => {
    if (!ready || !response) return;
    if (response.status !== ResponseStatus.SUCCESS) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    const org = response.data?.organization;
    if (!org) {
      router.push("/unauthorized");
      return;
    }

    if (org.slug !== slug && !isHostlyModerator) {
      router.push("/unauthorized");
      return;
    }

    if (!org.isActive) {
      if (orgRole === UserRole.Admin) router.push(`/${slug}/app/reactivate`);
      else router.push(`/${slug}/app/deactivated`);
    }
  }, [ready, response, slug, user, orgRole, router, isHostlyModerator]);
}

export const OrganizationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const router = useRouter();
  const { slug } = useParams();
  const cleanSlug =
    typeof slug === "string" ? slug.split("?")[0].toLowerCase() : "";

  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const orgRole = (clerkUser?.publicMetadata.role as UserRole) ?? undefined;

  // ✅ Loosen "ready": only depend on Clerk + slug (Convex auth can settle in the background)
  const ready = !!cleanSlug && isClerkLoaded && !!isSignedIn;

  // ✅ Start the org query as soon as we have a slug (don’t block on auth flags)
  const orgContext = useQuery(
    api.organizations.getOrganizationContext,
    cleanSlug ? { slug: cleanSlug } : "skip"
  );

  const user = (orgContext?.data?.user as UserWithPromoCode | null) ?? null;

  useHandleOrgRedirects({
    ready,
    response: orgContext,
    slug: cleanSlug,
    user,
    orgRole,
  });

  // ✅ Refresh on focus/visibility to recover after long idle
  useEffect(() => {
    const onFocus = () => router.refresh();
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

  // ✅ Slow-loading watchdog → fallback UI with retry
  const [tookTooLong, setTookTooLong] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setTookTooLong(true), 8000);
    return () => clearTimeout(id);
  }, []);

  // Gates AFTER all hooks:
  const stillLoading = !ready || orgContext === undefined;

  if (isClerkLoaded && !isSignedIn) {
    // Signed out explicitly
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

  if (orgContext.status === ResponseStatus.ERROR) {
    return (
      <MessagePage
        title="Failed to load organization"
        description={orgContext.error || "Please try again."}
        buttonLabel="Retry"
        onButtonClick={() => router.refresh()}
      />
    );
  }

  // Success assertions / normalization
  const org = orgContext.data?.organization;
  if (!org) {
    return (
      <MessagePage
        title="Organization not found"
        description="We couldn’t find this organization."
      />
    );
  }

  const connectedAccountId = orgContext.data.connectedAccountId ?? "";
  const connectedAccountEnabled =
    orgContext.data.connectedAccountStatus === StripeAccountStatus.VERIFIED;
  const subscription = orgContext.data.subscription;
  const availableCredits = orgContext.data.availableCredits ?? 0;

  if (!subscription || !user) {
    return (
      <MessagePage
        title="Incomplete data"
        description="Required account info is missing. Please contact support."
      />
    );
  }

  const value: OrganizationContextType = {
    organization: org,
    connectedAccountId,
    connectedAccountEnabled,
    subscription,
    availableCredits,
    user,
    orgRole,
    cleanSlug,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useContextOrganization = () => {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error(ErrorMessages.CONTEXT_ORGANIZATION_PROVER);
  return ctx;
};
