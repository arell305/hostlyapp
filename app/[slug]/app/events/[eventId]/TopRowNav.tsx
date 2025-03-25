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
    <div className="relative flex items-center justify-between pt-4 px-3 md:pt-0">
      {/* Left side button: Cancel or Home */}
      <div className="]">
        {isEditing ? (
          <Button variant="navGhost" size="nav" onClick={onCancelEdit}>
            Cancel
          </Button>
        ) : (
          <Button variant="navGhost" size="nav" onClick={handleNavigateHome}>
            Home
          </Button>
        )}
      </div>

      {/* Centered event name */}
      <p className="absolute left-1/2 transform -translate-x-1/2 text-lg font-bold text-center">
        {eventData.name}
      </p>

      {/* Right side: Edit button or empty space to keep layout consistent */}
      <div className=" flex justify-end">
        {!isEditing && (
          <Protect
            condition={(has) =>
              has({ permission: ClerkPermissions.CREATE_EVENT })
            }
            fallback={<div />}
          >
            <Button
              variant="navGhost"
              size="nav"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          </Protect>
        )}
      </div>
    </div>
  );
};

export default TopRowNav;
