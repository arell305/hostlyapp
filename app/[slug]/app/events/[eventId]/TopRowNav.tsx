import { Button } from "@/components/ui/button";
import { EventData, EventSchema } from "@/types/types";
import { Protect } from "@clerk/nextjs";

interface TopRowNavProps {
  eventData: EventSchema;
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
    <div className="flex items-center justify-between  pt-4">
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
          <div>
            <Button variant="navGhost" onClick={() => setIsEditing(true)}>
              Back
            </Button>
          </div>
          <p className="text-lg font-bold flex-grow text-center">
            {eventData.name}
          </p>
          <Protect
            condition={(has) => has({ permission: "org:events:create" })}
            fallback={<div className="w-[60px]"></div>}
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
