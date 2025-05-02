import { EventSchema } from "@/types/schemas-types";
import { Home, X } from "lucide-react";
import IconButton from "@/components/shared/buttonContainers/IconButton";
import TopBarContainer from "@/components/shared/containers/TopBarContainer";
import CenteredTitle from "@/components/shared/headings/CenteredTitle";

interface AddGuestTopRowProps {
  eventData: EventSchema;
  handleGoHome: () => void;
  handleGoBack: () => void;
}

const AddGuestTopRow: React.FC<AddGuestTopRowProps> = ({
  eventData,
  handleGoHome,
  handleGoBack,
}) => {
  return (
    <TopBarContainer>
      {" "}
      <div className="">
        <IconButton icon={<Home size={20} />} onClick={handleGoHome} />
      </div>
      {/* Centered event name */}
      <CenteredTitle title={eventData.name} />
      {/* Right side: Edit button or empty space to keep layout consistent */}
      <div className=" flex justify-end">
        <IconButton icon={<X size={20} />} onClick={handleGoBack} />
      </div>
    </TopBarContainer>
  );
};

export default AddGuestTopRow;
