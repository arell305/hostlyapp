import { EventSchema } from "@/types/schemas-types";
import { Home, Plus } from "lucide-react";
import IconButton from "@/components/shared/buttonContainers/IconButton";
import EditToggleButton from "@/components/shared/buttonContainers/EditToggleButton";
import TopBarContainer from "@/components/shared/containers/TopBarContainer";
import CenteredTitle from "@/components/shared/headings/CenteredTitle";
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
}) => {
  return (
    <TopBarContainer>
      {" "}
      <div className="">
        <IconButton
          icon={<Home size={20} />}
          onClick={handleGoHome}
          title="Home"
        />
      </div>
      {/* Centered event name */}
      <CenteredTitle title={eventData.name} />
      {/* Right side: Edit button or empty space to keep layout consistent */}
      <div className=" flex justify-end">
        {canEditEvent && (
          <EditToggleButton
            isEditing={isEditing}
            onToggle={() => setIsEditing((prev) => !prev)}
            onCancelEdit={onCancelEdit}
          />
        )}
        {canUploadGuest &&
          (isGuestListOpen ? (
            <IconButton
              icon={<Plus size={20} />}
              onClick={handleAddGuestList}
              title="Add Guest List"
              disabled={!isGuestListOpen}
            />
          ) : (
            <span className="text-sm text-muted-foreground">Closed</span>
          ))}
      </div>
    </TopBarContainer>
  );
};

export default TopRowNav;
