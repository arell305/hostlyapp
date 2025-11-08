"use client";

import { Doc } from "@/convex/_generated/dataModel";
import GenericEditDeleteButton from "@/shared/ui/buttonContainers/GenericEditDelete";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import TopBarContainer from "@/shared/ui/containers/TopBarContainer";
import CenteredTitle from "@/shared/ui/headings/CenteredTitle";
import { ArrowLeft } from "lucide-react";
import CampaignActionMenuContent from "./CampaignActionMenuContent";
import { useRouter } from "next/navigation";
import { useUserScope, useContextOrganization } from "@/shared/hooks/contexts";

interface CampaignNavProps {
  campaign: Doc<"campaigns">;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  onCancelEdit: () => void;
  canEditCampaign: boolean;
  onDelete: () => void;
}
const CampaignNav = ({
  campaign,
  isEditing,
  setIsEditing,
  onCancelEdit,
  canEditCampaign,
  onDelete,
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
          disabled={isEditing}
          variant="ghost"
        />
      </div>
      <CenteredTitle title={campaign.name} />
      <div className=" flex justify-end">
        <GenericEditDeleteButton
          doc={campaign}
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing((prev) => !prev)}
          onCancelEdit={() => setIsEditing(false)}
          onDelete={onDelete}
          entityName="Campaign"
          renderMobileMenu={({ onEdit, onDelete, onClose }) => (
            <CampaignActionMenuContent
              campaign={campaign}
              onEdit={onEdit}
              onDelete={onDelete}
              onClose={onClose}
            />
          )}
        />
      </div>
    </TopBarContainer>
  );
};

export default CampaignNav;
