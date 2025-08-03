import { ArrowLeft } from "lucide-react";
import IconButton from "@/components/shared/buttonContainers/IconButton";
import TopBarContainer from "@/components/shared/containers/TopBarContainer";
import CenteredTitle from "@/components/shared/headings/CenteredTitle";
import EditDeleteButton from "@/components/shared/buttonContainers/EditDeleteButton";
import { UserWithPromoCode } from "@/types/types";
import { UserRole } from "@/types/enums";

interface MemberTopBarProps {
  userData: UserWithPromoCode;
  onBack: () => void;
  isEditing: boolean;
  handleToggleEditing: () => void;
  handleCancelEditing: () => void;
  handleShowDeleteConfirmation: () => void;
  canEditUsers: boolean;
}

const MemberTopBar: React.FC<MemberTopBarProps> = ({
  userData,
  onBack,
  isEditing,
  handleToggleEditing,
  handleCancelEditing,
  handleShowDeleteConfirmation,
  canEditUsers,
}) => {
  const canEditOrDelete =
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
          disabled={isEditing}
        />
      </div>
      {/* Centered event name */}
      <CenteredTitle title={"Team Member"} />
      {/* Right side: Edit button or empty space to keep layout consistent */}
      {canEditOrDelete && (
        <div className=" flex justify-end">
          <EditDeleteButton
            isEditing={isEditing}
            onToggle={handleToggleEditing}
            onCancelEdit={handleCancelEditing}
            onDelete={handleShowDeleteConfirmation}
          />
        </div>
      )}
    </TopBarContainer>
  );
};

export default MemberTopBar;
