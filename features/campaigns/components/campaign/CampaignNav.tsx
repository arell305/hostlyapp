"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import TopBarContainer from "@/shared/ui/containers/TopBarContainer";
import CenteredTitle from "@/shared/ui/headings/CenteredTitle";
import { Archive, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserScope, useContextOrganization } from "@/shared/hooks/contexts";
import ResponsiveCampaignActions from "./ResponsiveCampaignActions";

interface CampaignNavProps {
  campaign: Doc<"campaigns">;
  onDelete: () => void;
  onEdit: () => void;
  onCancel: () => void;
}
const CampaignNav = ({
  campaign,
  onDelete,
  onEdit,
  onCancel,
}: CampaignNavProps) => {
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
        <ResponsiveCampaignActions
          campaign={campaign}
          onEdit={onEdit}
          onDelete={onDelete}
          onCancel={onCancel}
        />
      </div>
    </TopBarContainer>
  );
};

export default CampaignNav;
