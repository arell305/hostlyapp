"use client";

import { Doc } from "@/convex/_generated/dataModel";
import CampaignCard from "./CampaignCard";
import CustomCard from "@/shared/ui/cards/CustomCard";
import { useContextOrganization, useUserScope } from "@/shared/hooks/contexts";

interface CampaignsContentProps {
  campaigns: Doc<"campaigns">[];
}
const CampaignsContent = ({ campaigns }: CampaignsContentProps) => {
  const { organization } = useContextOrganization();
  const { userId } = useUserScope();

  const baseHref = `/${organization.slug}/app/campaigns/${userId}`;

  if (campaigns.length === 0) {
    return <p className="text-grayText">No campaigns found.</p>;
  }

  return (
    <CustomCard>
      {campaigns.map((campaign) => {
        const href = `${baseHref}/${campaign._id}`;
        return (
          <CampaignCard key={campaign._id} campaign={campaign} href={href} />
        );
      })}
    </CustomCard>
  );
};

export default CampaignsContent;
