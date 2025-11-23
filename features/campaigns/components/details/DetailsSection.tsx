import SectionContainer from "@/shared/ui/containers/SectionContainer";
import CampaignSubmit from "../CampaignSubmit";
import DetailsSelection from "./DetailsSelection";
import SectionBodyContainer from "@/shared/ui/containers/SectionBodyContainer";

const DetailsSection = () => {
  return (
    <SectionContainer className="gap-0">
      <SectionBodyContainer>
        <h2>Choose Name and Timing</h2>

        <DetailsSelection />
      </SectionBodyContainer>
      <CampaignSubmit />
    </SectionContainer>
  );
};

export default DetailsSection;
