"use client";

import { Doc } from "@/convex/_generated/dataModel";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import TopBarContainer from "@/shared/ui/containers/TopBarContainer";
import CenteredTitle from "@/shared/ui/headings/CenteredTitle";
import { Archive, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserScope, useContextOrganization } from "@/shared/hooks/contexts";

interface CampaignNavProps {
  campaign: Doc<"campaigns">;
  onDelete: () => void;
}
const CampaignNav = ({ campaign, onDelete }: CampaignNavProps) => {
  const { userId } = useUserScope();
  const { cleanSlug } = useContextOrganization();

  const router = useRouter();

  const handleGoBack = () => {
    router.push(`/${cleanSlug}/app/campaigns/${userId}`);
  };

  return (
    <TopBarContainer className="">
      {" "}
      <div className="">
        <IconButton
          icon={<ArrowLeft size={20} />}
          onClick={handleGoBack}
          title="Back"
          variant="ghost"
        />
      </div>
      <CenteredTitle title={campaign.name} />
      <div className=" flex justify-end">
        <IconButton
          icon={<Archive size={20} />}
          onClick={onDelete}
          title="Archive Campaign"
          variant="ghost"
        />
      </div>
    </TopBarContainer>
  );
};

export default CampaignNav;
