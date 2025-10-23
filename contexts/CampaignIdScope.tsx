"use client";

import { createContext, useContext } from "react";
import type { Id } from "convex/_generated/dataModel";

type CampaignIdScope = { campaignId: Id<"campaigns"> };

const CampaignIdScopeContext = createContext<CampaignIdScope | null>(null);

export function CampaignIdScopeProvider({
  campaignId,
  children,
}: {
  campaignId: Id<"campaigns">;
  children: React.ReactNode;
}) {
  return (
    <CampaignIdScopeContext.Provider value={{ campaignId }}>
      {children}
    </CampaignIdScopeContext.Provider>
  );
}

export function useCampaignIdScope(): CampaignIdScope {
  const context = useContext(CampaignIdScopeContext);
  if (!context) {
    throw new Error("CampaignIdScopeProvider missing");
  }

  return context;
}
