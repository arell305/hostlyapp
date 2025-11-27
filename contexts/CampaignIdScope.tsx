"use client";

import { createContext, useState, useEffect, type ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Id } from "convex/_generated/dataModel";
import { useCampaignById } from "@/domain/campaigns";
import { EventProvider } from "./EventContext";
import { CampaignWithGuestList } from "@/shared/types/types";

export type CampaignScope = {
  campaign: CampaignWithGuestList;
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

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const campaign = useCampaignById(campaignId);

  useEffect(() => {
    if (urlEditMode && campaign) {
      setIsEditing(true);

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
