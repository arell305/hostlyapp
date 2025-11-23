import {
  CampaignFormContextType,
  CampaignFormContext,
} from "@/contexts/campain/CampaignFormProvider";
import { useContext } from "react";

export const useCampaignForm = (): CampaignFormContextType => {
  const context = useContext(CampaignFormContext);
  if (!context)
    throw new Error("useCampaignForm must be used within CampaignFormProvider");
  return context;
};
