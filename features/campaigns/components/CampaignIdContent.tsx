"use client";

import ResponsiveConfirm from "@shared/ui/responsive/ResponsiveConfirm";
import { useUpdateCampaign } from "@/domain/campaigns";
import { CampaignValues } from "@shared/types/types";
import { Doc } from "convex/_generated/dataModel";
import { useState } from "react";
import { useCampaignScope } from "@/contexts/CampaignIdScope";

interface CampaignDetailsProps {
  isEditMode: boolean;
}
const CampaignDetails = ({ isEditMode }: CampaignDetailsProps) => {
  const { campaign } = useCampaignScope();

  const {
    updateCampaign,
    updateCampaignLoading,
    updateCampaignError,
    setUpdateCampaignError,
  } = useUpdateCampaign();

  const handleSave = async (update: CampaignValues): Promise<boolean> => {
    const result = await updateCampaign({
      campaignId: campaign._id,
      updates: { ...update },
    });
    return result.success;
  };

  return <div>CampaignIdContent</div>;
};

export default CampaignDetails;
