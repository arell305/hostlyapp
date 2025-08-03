import { EventSchema, GuestListInfoSchema } from "@/types/schemas-types";
import { Home, Plus } from "lucide-react";
import IconButton from "@/components/shared/buttonContainers/IconButton";
import EditToggleButton from "@/components/shared/buttonContainers/EditDeleteButton";
import TopBarContainer from "@/components/shared/containers/TopBarContainer";
import CenteredTitle from "@/components/shared/headings/CenteredTitle";
import EditDeleteButton from "@/components/shared/buttonContainers/EditDeleteButton";

interface TopRowNavProps {
  eventData: EventSchema;
  isAdminOrg: boolean;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  onCancelEdit: () => void;
  handleGoHome: () => void;
  canUploadGuest: boolean;
  canEditEvent: boolean;
  handleAddGuestList: () => void;
  isGuestListOpen: boolean;
  guestListInfo?: GuestListInfoSchema | null;
  onDelete: () => void;
}

const TopRowNav: React.FC<TopRowNavProps> = ({
  eventData,
  isGuestListOpen,
  isEditing,
  setIsEditing,
  onCancelEdit,
  handleGoHome,
  canUploadGuest,
  canEditEvent,
  handleAddGuestList,
  guestListInfo,
  onDelete,
}) => {
  return (
    <TopBarContainer className="pt-0 md:pt-1">
      {" "}
      <div className="">
        <IconButton
          icon={<Home size={20} />}
          onClick={handleGoHome}
          title="Home"
          disabled={isEditing}
        />
      </div>
      {/* Centered event name */}
      <CenteredTitle title={eventData.name} />
      {/* Right side: Edit button or empty space to keep layout consistent */}
      <div className=" flex justify-end">
        {canEditEvent && (
          <EditDeleteButton
            isEditing={isEditing}
            onToggle={() => setIsEditing((prev) => !prev)}
            onCancelEdit={onCancelEdit}
            onDelete={onDelete}
          />
        )}
        {canUploadGuest &&
          guestListInfo &&
          (isGuestListOpen ? (
            <IconButton
              icon={<Plus size={20} />}
              onClick={handleAddGuestList}
              title="Add Guest List"
              disabled={!isGuestListOpen}
            />
          ) : (
            <span className="text-sm text-muted-foreground">
              Guest List Closed
            </span>
          ))}
      </div>
    </TopBarContainer>
  );
};

export default TopRowNav;
