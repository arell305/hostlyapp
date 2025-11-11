"use client";

import { createContext } from "react";
import type { Id } from "convex/_generated/dataModel";
import { useCampaignById } from "@/domain/campaigns";
import type { Doc } from "@/convex/_generated/dataModel";
import { EventProvider } from "./EventContext";

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

  const eventId = campaign.eventId;

  if (eventId) {
    return (
      <CampaignScopeContext.Provider value={{ campaign }}>
        <EventProvider eventId={eventId}>{children}</EventProvider>
      </CampaignScopeContext.Provider>
    );
  }

  return (
    <CampaignScopeContext.Provider value={{ campaign }}>
      {children}
    </CampaignScopeContext.Provider>
  );
}
