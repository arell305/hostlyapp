"use client";

import { createContext } from "react";
import type { Id } from "convex/_generated/dataModel";
import { useCampaignById } from "@/domain/campaigns";
import type { Doc } from "@/convex/_generated/dataModel";

export type CampaignScope = { campaign: Doc<"campaigns"> };

export const CampaignScopeContext = createContext<CampaignScope | null>(null);

export function CampaignScopeProvider({
  campaignId,
  children,
}: {
  campaignId: Id<"campaigns">;
  children: React.ReactNode;
}) {
  const campaign = useCampaignById(campaignId);
  if (!campaign) {
    return null;
  }

  return (
    <CampaignScopeContext.Provider value={{ campaign }}>
      {children}
    </CampaignScopeContext.Provider>
  );
}
