import { Home, X } from "lucide-react";
import IconButton from "@/components/shared/buttonContainers/IconButton";
import TopBarContainer from "@/components/shared/containers/TopBarContainer";
import CenteredTitle from "@/components/shared/headings/CenteredTitle";
import { Doc } from "convex/_generated/dataModel";

interface AddGuestTopRowProps {
  eventData: Doc<"events">;
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
      <CenteredTitle title={eventData.name} />
      <div className=" flex justify-end">
        <IconButton icon={<X size={20} />} onClick={handleGoBack} />
      </div>
    </TopBarContainer>
  );
};

export default AddGuestTopRow;
