"use client";

import { ArrowLeft } from "lucide-react";
import IconButton from "@shared/ui/buttonContainers/IconButton";
import TopBarContainer from "@shared/ui/containers/TopBarContainer";
import CenteredTitle from "@shared/ui/headings/CenteredTitle";
import { UserWithPromoCode } from "@/shared/types/types";
import { UserRole } from "@/shared/types/enums";
import ResponsiveUserActions from "./buttons/ResponsiveUserActions";

interface MemberTopBarProps {
  userData: UserWithPromoCode;
  onBack: () => void;
  handleShowDeleteConfirmation: () => void;
  canEditUsers: boolean;
  onReactivate: () => void;
}

const MemberTopBar: React.FC<MemberTopBarProps> = ({
  userData,
  onBack,
  handleShowDeleteConfirmation,
  canEditUsers,
  onReactivate,
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
          <ResponsiveUserActions
            user={userData}
            onDelete={handleShowDeleteConfirmation}
            onReactivate={onReactivate}
          />
        </div>
      )}
    </TopBarContainer>
  );
};

export default MemberTopBar;
