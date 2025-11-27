"use client";

import CampaignStepper from "./CampaignStepper";
import EventsSelection from "./events/EventsSelection";
import TemplateSelection from "./TemplateSelection";
import DetailsSection from "./details/DetailsSection";
import { useCreateCampaignForm } from "../contexts/CampaignFormContext";
import AudienceSection from "./audience/AudienceSection";

interface CampaignFormContentProps {
  triggerCancelModal: () => void;
}

const CampaignFormContent: React.FC<CampaignFormContentProps> = ({
  triggerCancelModal,
}) => {
  const { currentStep } = useCreateCampaignForm();

  return (
    <div className="max-w-4xl mx-auto">
      <CampaignStepper />
      {currentStep === "event" && (
        <EventsSelection triggerCancelModal={triggerCancelModal} />
      )}
      {currentStep === "audience" && <AudienceSection />}
      {currentStep === "template" && <TemplateSelection />}
      {currentStep === "details" && <DetailsSection />}
    </div>
  );
};

export default CampaignFormContent;
