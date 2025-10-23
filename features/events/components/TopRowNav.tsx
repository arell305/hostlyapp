"use client";

import { Home, Plus } from "lucide-react";
import IconButton from "@shared/ui/buttonContainers/IconButton";
import TopBarContainer from "@shared/ui/containers/TopBarContainer";
import CenteredTitle from "@shared/ui/headings/CenteredTitle";
import EditDeleteButton from "@shared/ui/buttonContainers/EditDeleteButton";
import { Doc } from "convex/_generated/dataModel";

interface TopRowNavProps {
  eventData: Doc<"events">;
  isAdminOrg: boolean;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  onCancelEdit: () => void;
  handleGoHome: () => void;
  canUploadGuest: boolean;
  canEditEvent: boolean;
  handleAddGuestList: () => void;
  isGuestListOpen: boolean;
  guestListInfo?: Doc<"guestListInfo"> | null;
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
    <TopBarContainer className="">
      {" "}
      <div className="">
        <IconButton
          icon={<Home size={20} />}
          onClick={handleGoHome}
          title="Home"
          disabled={isEditing}
        />
      </div>
      <CenteredTitle title={eventData.name} />
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
