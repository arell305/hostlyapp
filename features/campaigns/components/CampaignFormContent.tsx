"use client";

import { useCampaignForm } from "../contexts/CampaignFormContext";
import CampaignStepper from "./CampaignStepper";
import EventsSelection from "./events/EventsSelection";
import TemplateSelection from "./TemplateSelection";
import DetailsSection from "./details/DetailsSection";

interface CampaignFormContentProps {
  triggerCancelModal: () => void;
}

const CampaignFormContent: React.FC<CampaignFormContentProps> = ({
  triggerCancelModal,
}) => {
  const { currentStep } = useCampaignForm();

  return (
    <div className="max-w-4xl mx-auto">
      <CampaignStepper />
      {currentStep === "event" && (
        <EventsSelection triggerCancelModal={triggerCancelModal} />
      )}
      {currentStep === "template" && <TemplateSelection />}
      {currentStep === "details" && <DetailsSection />}
    </div>
  );
};

export default CampaignFormContent;
