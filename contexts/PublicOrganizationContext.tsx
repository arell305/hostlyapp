"use client";

import { createContext, useContext, useMemo } from "react";
import { ErrorMessages } from "@shared/types/enums";
import type { OrganizationPublic } from "@shared/types/types";
import { usePreloadedQuery, type Preloaded } from "convex/react";
import { api } from "@convex/_generated/api";

type PublicOrganizationContextType = {
  userId: string | null;
  organizationPublic: OrganizationPublic;
};

type InitialPayload = {
  userId: string | null;
  preloadedOrg: Preloaded<
    typeof api.organizations.getPublicOrganizationContext
  >;
};

const PublicOrganizationContext = createContext<
  PublicOrganizationContextType | undefined
>(undefined);

export function PublicOrganizationProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: InitialPayload;
}) {
  const organizationPublic = usePreloadedQuery(initial.preloadedOrg);

  const value = useMemo<PublicOrganizationContextType>(
    () => ({
      userId: initial.userId,
      organizationPublic,
    }),
    [initial.userId, organizationPublic]
  );

  return (
    <PublicOrganizationContext.Provider value={value}>
      {children}
    </PublicOrganizationContext.Provider>
  );
}

export function useContextPublicOrganization() {
  const ctx = useContext(PublicOrganizationContext);
  if (!ctx) throw new Error(ErrorMessages.CONTEXT_ORGANIZATION_PROVER);
  return ctx;
}
