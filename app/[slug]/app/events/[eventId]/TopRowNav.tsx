import { Button } from "@/components/ui/button";
import { EventSchema } from "@/types/schemas-types";
import { Protect } from "@clerk/nextjs";
import { ClerkPermissions } from "@/types/enums";
interface TopRowNavProps {
  eventData: EventSchema;
  isAdminOrg: boolean;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  onCancelEdit: () => void;
  handleNavigateHome: () => void;
}

const TopRowNav: React.FC<TopRowNavProps> = ({
  eventData,
  isEditing,
  setIsEditing,
  onCancelEdit,
  handleNavigateHome,
}) => {
  return (
    <>
      {isEditing ? (
        <div className="flex items-center justify-between  pt-4">
          <div className="flex items-center">
            <Button variant="navGhost" onClick={onCancelEdit}>
              Cancel
            </Button>
          </div>
          <p className="text-lg font-bold flex-grow text-center mr-[80px]">
            {eventData.name}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-4 px-2 md:px-10">
          <Button
            className="w-[60px] md:w-[30px]"
            variant="navGhost"
            onClick={handleNavigateHome}
          >
            Back
          </Button>

          <p className="text-lg font-bold flex-1 text-center">
            {eventData.name}
          </p>

          <Protect
            condition={(has) =>
              has({ permission: ClerkPermissions.CREATE_EVENT })
            }
            fallback={<div className="w-[60px] md:w-[30px]"></div>}
          >
            <Button
              className="w-[60px] md:w-[30px]"
              variant="navGhost"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          </Protect>
        </div>
      )}
    </>
  );
};

export default TopRowNav;
