"use client";

import { ArrowLeft, Pen, Plus, X } from "lucide-react";
import IconButton from "@shared/ui/buttonContainers/IconButton";
import TopBarContainer from "@shared/ui/containers/TopBarContainer";
import CenteredTitle from "@shared/ui/headings/CenteredTitle";
import { Doc } from "convex/_generated/dataModel";
import ResponsivePromoterMenuContent from "./nav/ResponsivePromoterMenuContent";
import ResponsiveAdminMenuContent from "./nav/ResponsiveAdminMenuContent";
import { useEventForm } from "@/shared/hooks/contexts";
import IconButtonContainer from "@/shared/ui/buttonContainers/IconButtonContainer";

interface TopRowNavProps {
  eventData: Doc<"events">;
  isAdminOrg: boolean;
  onCancelEdit: () => void;
  handleGoBack: () => void;
  canUploadGuest: boolean;
  canEditEvent: boolean;
  handleAddGuestList: () => void;
  isGuestListOpen: boolean;
  guestListInfo?: Doc<"guestListInfo"> | null;
  onDelete: () => void;
  onAddCampaign: () => void;
}

const TopRowNav: React.FC<TopRowNavProps> = ({
  eventData,
  isGuestListOpen,
  onCancelEdit,
  handleGoBack,
  canUploadGuest,
  canEditEvent,
  handleAddGuestList,
  guestListInfo,
  onDelete,
  onAddCampaign,
}) => {
  const { setIsEditing, isEditing } = useEventForm();
  const handleEdit = () => {
    setIsEditing?.(!isEditing);
  };

  return (
    <TopBarContainer className="">
      <div className="">
        <IconButton
          icon={<ArrowLeft size={20} />}
          onClick={handleGoBack}
          title="Back"
        />
      </div>
      <CenteredTitle title={eventData.name} />
      <div className="flex justify-end gap-2 items-center">
        {canEditEvent &&
          (isEditing ? (
            <IconButton
              icon={<X size={20} />}
              onClick={onCancelEdit}
              title="Cancel Editing"
            />
          ) : (
            <IconButtonContainer>
              <IconButton
                icon={<Pen size={20} />}
                onClick={handleEdit}
                title="Edit Event"
              />
              <ResponsiveAdminMenuContent
                event={eventData}
                onDelete={onDelete}
                onAddCampaign={onAddCampaign}
              />
            </IconButtonContainer>
          ))}

        <IconButtonContainer>
          {canUploadGuest &&
            guestListInfo &&
            (isGuestListOpen ? (
              <IconButton
                icon={<Plus size={20} />}
                onClick={handleAddGuestList}
                title="Add Guest List"
              />
            ) : (
              <span className="text-sm ">Guest List Closed</span>
            ))}

          {canUploadGuest && (
            <ResponsivePromoterMenuContent onAddCampaign={onAddCampaign} />
          )}
        </IconButtonContainer>
      </div>
    </TopBarContainer>
  );
};

export default TopRowNav;
