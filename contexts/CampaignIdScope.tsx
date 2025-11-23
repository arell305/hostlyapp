"use client";

import { createContext, useState, useEffect, type ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Id } from "convex/_generated/dataModel";
import { useCampaignById } from "@/domain/campaigns";
import type { Doc } from "@/convex/_generated/dataModel";
import { EventProvider } from "./EventContext";

export type CampaignScope = {
  campaign: Doc<"campaigns">;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
};

export const CampaignScopeContext = createContext<CampaignScope | null>(null);

export function CampaignScopeProvider({
  campaignId,
  children,
}: {
  campaignId: Id<"campaigns">;
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlEditMode = searchParams.get("edit") === "true";

  const [isEditing, setIsEditing] = useState(false);
  const campaign = useCampaignById(campaignId);

  // Sync isEditing with ?edit=true param
  useEffect(() => {
    if (urlEditMode && campaign) {
      setIsEditing(true);

      // Clean up the URL (remove ?edit=true) without page reload
      const currentPath = window.location.pathname;
      router.replace(currentPath, { scroll: false });
    }
  }, [urlEditMode, campaign, router]);

  if (!campaign) {
    return null;
  }

  const value: CampaignScope = {
    campaign,
    isEditing,
    setIsEditing,
  };

  return (
    <CampaignScopeContext.Provider value={value}>
      {campaign.eventId ? (
        <EventProvider eventId={campaign.eventId}>{children}</EventProvider>
      ) : (
        children
      )}
    </CampaignScopeContext.Provider>
  );
}
