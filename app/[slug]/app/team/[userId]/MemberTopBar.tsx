import { ArrowLeft } from "lucide-react";
import IconButton from "@/components/shared/buttonContainers/IconButton";
import TopBarContainer from "@/components/shared/containers/TopBarContainer";
import CenteredTitle from "@/components/shared/headings/CenteredTitle";
import { UserWithPromoCode } from "@/types/types";
import { UserRole } from "@/types/enums";
import TrashButton from "@/components/shared/buttonContainers/TrashButton";

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
      {/* Centered event name */}
      <CenteredTitle title={"Team Member"} />
      {/* Right side: Edit button or empty space to keep layout consistent */}
      {canDelete && (
        <div className=" flex justify-end">
          <TrashButton onDelete={handleShowDeleteConfirmation} />
        </div>
      )}
    </TopBarContainer>
  );
};

export default MemberTopBar;
