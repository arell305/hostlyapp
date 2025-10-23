"use client";

import { ArrowLeft } from "lucide-react";
import IconButton from "@shared/ui/buttonContainers/IconButton";
import TopBarContainer from "@shared/ui/containers/TopBarContainer";
import CenteredTitle from "@shared/ui/headings/CenteredTitle";
import { UserWithPromoCode } from "@/shared/types/types";
import { UserRole } from "@/shared/types/enums";
import TrashButton from "@shared/ui/buttonContainers/TrashButton";

interface MemberTopBarProps {
  userData: UserWithPromoCode;
  onBack: () => void;
  handleShowDeleteConfirmation: () => void;
  canEditUsers: boolean;
}

const MemberTopBar: React.FC<MemberTopBarProps> = ({
  userData,
  onBack,
  handleShowDeleteConfirmation,
  canEditUsers,
}) => {
  const canDelete =
    canEditUsers &&
    userData.role !== UserRole.Admin &&
    userData.role !== UserRole.Hostly_Admin;
  return (
    <TopBarContainer className="pt-0">
      {" "}
      <div className="">
        <IconButton
          icon={<ArrowLeft size={20} />}
          onClick={onBack}
          title="Back"
        />
      </div>
      <CenteredTitle title={"Team Member"} />
      {canDelete && (
        <div className=" flex justify-end">
          <TrashButton onDelete={handleShowDeleteConfirmation} />
        </div>
      )}
    </TopBarContainer>
  );
};

export default MemberTopBar;
