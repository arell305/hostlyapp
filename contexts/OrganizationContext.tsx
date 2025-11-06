"use client";

import { createContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, useOrganization, useOrganizationList } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { StripeAccountStatus, UserRole } from "@shared/types/enums";
import type { UserWithPromoCode } from "@shared/types/types";
import FullLoading from "@shared/ui/loading/FullLoading";
import MessagePage from "@shared/ui/shared-page/MessagePage";
import { isHostlyUser } from "@/shared/utils/permissions";
import { Doc } from "convex/_generated/dataModel";

type OrganizationContextType = {
  organization: Doc<"organizations">;
  connectedAccountId: string;
  connectedAccountEnabled: boolean;
  subscription: Doc<"subscriptions">;
  availableCredits: number;
  user: UserWithPromoCode;
  orgRole?: UserRole;
  cleanSlug: string;
};

export const OrganizationContext = createContext<
  OrganizationContextType | undefined
>(undefined);

export const OrganizationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const router = useRouter();
  const { slug } = useParams();
  const cleanSlug =
    typeof slug === "string" ? slug.split("?")[0].toLowerCase() : "";

  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const orgRole = (clerkUser?.publicMetadata.role as UserRole) ?? undefined;

  const { organization: clerkOrg, isLoaded: orgLoaded } = useOrganization();
  const { setActive, isLoaded: orgListLoaded } = useOrganizationList();

  const shouldQueryOrg = !!cleanSlug && isClerkLoaded && !!isSignedIn;
  const orgContext = useQuery(
    api.organizations.getOrganizationContext,
    shouldQueryOrg ? { slug: cleanSlug } : "skip"
  );

  const lastLoadedRef = useRef<number>(Date.now());
  const lastSetRef = useRef<string | null>(null);
  const [tookTooLong, setTookTooLong] = useState(false);

  useEffect(() => {
    if (
      !isClerkLoaded ||
      !isSignedIn ||
      !orgLoaded ||
      !orgListLoaded ||
      !orgContext?.organization
    )
      return;
    const org = orgContext.organization;
    if (!org.clerkOrganizationId || !setActive) return;

    const role =
      (clerkUser?.publicMetadata.role as UserRole | undefined) ?? undefined;
    const isStaff = isHostlyUser(String(role));
    const isAdminSlug = org.slug === "admin";
    if (isAdminSlug && !isStaff) return;

    const expectedId = org.clerkOrganizationId;
    if (clerkOrg?.id === expectedId || lastSetRef.current === expectedId)
      return;

    setActive({ organization: expectedId }).finally(() => {
      lastSetRef.current = expectedId;
    });
  }, [
    isClerkLoaded,
    isSignedIn,
    orgLoaded,
    orgListLoaded,
    orgContext?.organization,
    clerkOrg?.id,
    setActive,
    clerkUser?.publicMetadata?.role,
  ]);

  useEffect(() => {
    const TTL = 2 * 60 * 1000;
    const onFocus = () => {
      if (Date.now() - lastLoadedRef.current > TTL) router.refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [router]);

  useEffect(() => {
    if (orgContext) lastLoadedRef.current = Date.now();
  }, [orgContext]);

  useEffect(() => {
    const id = setTimeout(() => setTookTooLong(true), 8000);
    return () => clearTimeout(id);
  }, []);

  const stillLoading = !shouldQueryOrg || orgContext === undefined;
  const org = orgContext?.organization;
  const ctxUser = orgContext?.user;
  const connectedAccountId = orgContext?.connectedAccountId ?? "";
  const connectedAccountEnabled =
    orgContext?.connectedAccountStatus === StripeAccountStatus.VERIFIED;
  const subscription = orgContext?.subscription as
    | Doc<"subscriptions">
    | undefined;
  const availableCredits = orgContext?.availableCredits ?? 0;

  const value = useMemo<OrganizationContextType | null>(() => {
    if (!org || !ctxUser || !subscription) return null;
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
    ctxUser,
    subscription,
    connectedAccountId,
    connectedAccountEnabled,
    availableCredits,
    orgRole,
    cleanSlug,
  ]);

  if (isClerkLoaded && !isSignedIn) {
    return (
      <MessagePage
        title="Please sign in"
        description="Your session has expired."
        buttonLabel="Sign in"
        onButtonClick={() => router.push("/sign-in")}
      />
    );
  }

  if (stillLoading) {
    return tookTooLong ? (
      <MessagePage
        title="Reconnecting…"
        description="Taking longer than usual. Try refreshing."
        buttonLabel="Retry"
        onButtonClick={() => router.refresh()}
      />
    ) : (
      <FullLoading />
    );
  }

  if (!value) {
    return (
      <MessagePage
        title="Access Denied"
        description="You don't have permission to view this organization."
      />
    );
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
