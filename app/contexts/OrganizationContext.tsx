"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  PropsWithChildren,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";

import {
  ErrorMessages,
  StripeAccountStatus,
  ResponseStatus,
  UserRole,
} from "@/types/enums";

import { UserWithPromoCode, OrganizationSchema } from "@/types/types";
import { SubscriptionSchema } from "@/types/schemas-types";

// ---------- Types ----------
type OrganizationContextType = {
  organization?: OrganizationSchema;
  connectedAccountId?: string | null;
  connectedAccountEnabled?: boolean;
  subscription?: SubscriptionSchema;
  organizationContextLoading: boolean;
  organizationContextError: string | null;
  availableCredits?: number;
  user?: UserWithPromoCode | null;
  orgRole?: UserRole;
  cleanSlug?: string;
};

// ---------- Context ----------
const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

// ---------- Redirect hook (auth + org guards) ----------
function useHandleOrgRedirects({
  ready,
  response,
  slug,
  user,
  orgRole,
}: {
  ready: boolean;
  response:
    | {
        status: ResponseStatus;
        error?: string | null;
        data?: any;
      }
    | undefined;
  slug: string;
  user: UserWithPromoCode | null;
  orgRole?: UserRole;
}) {
  const router = useRouter();
  const isHostlyModerator =
    orgRole === UserRole.Hostly_Moderator || orgRole === UserRole.Hostly_Admin;

  useEffect(() => {
    if (!ready) return; // wait for auth + queries to be runnable
    if (!response) return;

    if (response.status === ResponseStatus.ERROR) return; // don't redirect on transient errors here

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
      if (orgRole === UserRole.Admin) {
        router.push(`/${slug}/app/reactivate`);
      } else {
        router.push(`/${slug}/app/deactivated`);
      }
    }
  }, [ready, response, slug, user, orgRole, router, isHostlyModerator]);
}

// ---------- Provider ----------
export const OrganizationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { slug } = useParams();
  const cleanSlug =
    typeof slug === "string" ? slug.split("?")[0].toLowerCase() : "";

  // Clerk state
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const orgRole = (clerkUser?.publicMetadata.role as UserRole) ?? undefined;

  // Convex auth bridge state
  const { isAuthenticated, isLoading: isConvexAuthLoading } = useConvexAuth();

  // Only allow queries when everything is truly ready
  const ready =
    !!cleanSlug &&
    isClerkLoaded &&
    !!isSignedIn &&
    isAuthenticated &&
    !isConvexAuthLoading;

  // Queries gated by `ready`
  const orgContext = useQuery(
    api.organizations.getOrganizationContext,
    ready ? { slug: cleanSlug } : "skip"
  );

  const userFromDb = useQuery(
    api.users.findUserByClerkId,
    ready && clerkUser ? { clerkUserId: clerkUser.id } : "skip"
  );

  const user = userFromDb?.data?.user ?? null;

  // Handle redirects only after auth + data are sane
  useHandleOrgRedirects({
    ready,
    response: orgContext,
    slug: cleanSlug,
    user,
    orgRole,
  });

  // Compose context value
  const value = useMemo<OrganizationContextType>(() => {
    // Not ready or queries not mounted yet
    if (!ready || !orgContext || !userFromDb) {
      return {
        organizationContextLoading: true,
        organizationContextError: null,
      };
    }

    if (orgContext.status === ResponseStatus.ERROR) {
      return {
        organizationContextLoading: false,
        organizationContextError: orgContext.error ?? "Unknown error",
      };
    }

    if (userFromDb.status === ResponseStatus.ERROR) {
      return {
        organizationContextLoading: false,
        organizationContextError: userFromDb.error ?? "Unknown error",
      };
    }

    // SUCCESS path
    return {
      organization: orgContext.data?.organization,
      connectedAccountId: orgContext.data?.connectedAccountId ?? null,
      connectedAccountEnabled:
        orgContext.data?.connectedAccountStatus ===
        StripeAccountStatus.VERIFIED,
      subscription: orgContext.data?.subscription,
      availableCredits: orgContext.data?.availableCredits,
      organizationContextLoading: false,
      organizationContextError: null,
      user,
      orgRole,
      cleanSlug,
    };
  }, [ready, orgContext, userFromDb, user, orgRole, cleanSlug]);

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

// ---------- Hook ----------
export const useContextOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(ErrorMessages.CONTEXT_ORGANIZATION_PROVER);
  }
  return context;
};
