import { Button } from "@/components/ui/button";
import BackButton from "@/dashboard/components/BackButton";
import { EventData, GuestListInfo, TicketInfo } from "@/types";
import { Protect } from "@clerk/nextjs";
import { useState } from "react";

interface TopRowNavProps {
  eventData: EventData;
  isAdminOrg: boolean;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  onCancelEdit: () => void;
}

const TopRowNav: React.FC<TopRowNavProps> = ({
  eventData,
  isAdminOrg,
  isEditing,
  setIsEditing,
  onCancelEdit,
}) => {
  const backRoute = isAdminOrg ? `/${eventData.clerkOrganizationId}` : "/";
  return (
    <div className="flex items-center justify-between">
      {isEditing ? (
        <>
          <div className="flex items-center">
            <Button variant="navGhost" onClick={onCancelEdit}>
              Cancel
            </Button>
          </div>
          <p className="text-lg font-bold flex-grow text-center mr-[80px]">
            {eventData.name}
          </p>
        </>
      ) : (
        <>
          <BackButton text="Back" targetRoute={backRoute} />
          <p className="text-lg font-bold flex-grow text-center">
            {eventData.name}
          </p>
          <Protect
            condition={(has) => has({ permission: "org:events:create" })}
            fallback={<p></p>}
          >
            <Button variant="navGhost" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </Protect>
        </>
      )}
    </div>
  );
};

export default TopRowNav;
