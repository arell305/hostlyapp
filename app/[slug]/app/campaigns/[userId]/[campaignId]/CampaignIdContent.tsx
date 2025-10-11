import { useUpdateCampaign } from "@/hooks/convex/campaigns";
import { CampaignValues } from "@/types/types";
import { Doc } from "convex/_generated/dataModel";
import React, { useState } from "react";

interface CampaignIdContentProps {
  campaign: Doc<"campaigns">;
}
const CampaignIdContent = ({ campaign }: CampaignIdContentProps) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
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

export default CampaignIdContent;
