import {
  CampaignScope,
  CampaignScopeContext,
} from "@/contexts/CampaignIdScope";
import { useContext } from "react";

export function useCampaignScope(): CampaignScope {
  const context = useContext(CampaignScopeContext);
  if (!context) {
    throw new Error("CampaignScopeProvider missing");
  }

  return context;
}
