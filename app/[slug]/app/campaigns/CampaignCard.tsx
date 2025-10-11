import CustomCard from "@/components/shared/cards/CustomCard";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Doc } from "convex/_generated/dataModel";
import React from "react";

interface CampaignCardProps {
  campaign: Doc<"campaigns">;
}

const CampaignCard = ({ campaign }: CampaignCardProps) => {
  return (
    <CustomCard>
      <CardHeader>
        <CardTitle>{campaign.name}</CardTitle>
      </CardHeader>
    </CustomCard>
  );
};

export default CampaignCard;
