import { Doc } from "convex/_generated/dataModel";
import React from "react";
import CampaignCard from "../CampaignCard";

interface CampaignsContentProps {
  campaigns: Doc<"campaigns">[];
}
const CampaignsContent = ({ campaigns }: CampaignsContentProps) => {
  return (
    <div>
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign._id} campaign={campaign} />
      ))}
    </div>
  );
  return <div>CampaignsContent</div>;
};

export default CampaignsContent;
