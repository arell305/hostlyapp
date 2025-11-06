"use client";

import { createContext, useMemo } from "react";
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

export const PublicOrganizationContext = createContext<
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
