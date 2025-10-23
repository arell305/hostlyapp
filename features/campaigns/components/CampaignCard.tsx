"use client";

import CustomCard from "@shared/ui/cards/CustomCard";
import { CardHeader, CardTitle } from "@shared/ui/primitive/card";
import { Doc } from "convex/_generated/dataModel";

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
