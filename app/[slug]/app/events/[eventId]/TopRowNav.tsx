import { EventSchema } from "@/types/schemas-types";
import { Protect } from "@clerk/nextjs";
import { ClerkPermissions } from "@/types/enums";
import { Home } from "lucide-react";
import IconButton from "@/components/shared/buttonContainers/IconButton";
import EditToggleButton from "@/components/shared/buttonContainers/EditToggleButton";
interface TopRowNavProps {
  eventData: EventSchema;
  isAdminOrg: boolean;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  onCancelEdit: () => void;
  handleGoHome: () => void;
}

const TopRowNav: React.FC<TopRowNavProps> = ({
  eventData,
  isEditing,
  setIsEditing,
  onCancelEdit,
  handleGoHome,
}) => {
  return (
    <div className="relative flex items-center justify-between pt-4 px-3 md:px-0 mb-4">
      <div className="">
        <IconButton icon={<Home size={20} />} onClick={handleGoHome} />
      </div>

      {/* Centered event name */}
      <p className="absolute left-1/2 transform -translate-x-1/2 text-lg font-bold text-center">
        {eventData.name}
      </p>

      {/* Right side: Edit button or empty space to keep layout consistent */}
      <div className=" flex justify-end">
        <Protect
          condition={(has) =>
            has({ permission: ClerkPermissions.CREATE_EVENT })
          }
          fallback={<div />}
        >
          <EditToggleButton
            isEditing={isEditing}
            onToggle={() => setIsEditing((prev) => !prev)}
            onCancelEdit={onCancelEdit}
          />
        </Protect>
      </div>
    </div>
  );
};

export default TopRowNav;
