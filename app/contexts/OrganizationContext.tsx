"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  PropsWithChildren,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
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
  const { slug } = useParams();
  const cleanSlug =
    typeof slug === "string" ? slug.split("?")[0].toLowerCase() : "";

  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const orgRole = (clerkUser?.publicMetadata.role as UserRole) ?? undefined;

  const { isAuthenticated, isLoading: isConvexAuthLoading } = useConvexAuth();

  const ready =
    !!cleanSlug &&
    isClerkLoaded &&
    !!isSignedIn &&
    isAuthenticated &&
    !isConvexAuthLoading;

  // Hooks called unconditionally
  const orgContext = useQuery(
    api.organizations.getOrganizationContext,
    ready ? { slug: cleanSlug } : "skip"
  );

  const user = (orgContext?.data?.user as UserWithPromoCode | null) ?? null;

  useHandleOrgRedirects({
    ready,
    response: orgContext,
    slug: cleanSlug,
    user,
    orgRole,
  });

  // Gates AFTER all hooks:
  const stillLoading = !ready || orgContext === undefined;
  if (stillLoading) return <FullLoading />;

  if (orgContext.status === ResponseStatus.ERROR) {
    return (
      <MessagePage
        title="Failed to load organization"
        description={orgContext.error || "Please try again."}
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

  // Not using useMemo (no hook), so no order issues:
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
