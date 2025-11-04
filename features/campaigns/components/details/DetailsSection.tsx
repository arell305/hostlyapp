import SectionContainer from "@/shared/ui/containers/SectionContainer";
import CampaignSubmit from "../CampaignSubmit";
import DetailsSelection from "./DetailsSelection";

const DetailsSection = () => {
  return (
    <SectionContainer>
      <h2>Choose Name and Timing for your campaign</h2>

      <DetailsSelection />
      <CampaignSubmit />
    </SectionContainer>
  );
};

export default DetailsSection;
