"use client";

import { ArrowLeft, X } from "lucide-react";
import IconButton from "@shared/ui/buttonContainers/IconButton";
import TopBarContainer from "@shared/ui/containers/TopBarContainer";
import CenteredTitle from "@shared/ui/headings/CenteredTitle";
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
        <IconButton
          icon={<ArrowLeft size={20} />}
          onClick={handleGoHome}
          title="Go Back"
        />
      </div>
      <CenteredTitle title={eventData.name} />
      <div className=" flex justify-end">
        <IconButton
          icon={<X size={20} />}
          onClick={handleGoBack}
          title="Close"
        />
      </div>
    </TopBarContainer>
  );
};

export default AddGuestTopRow;
