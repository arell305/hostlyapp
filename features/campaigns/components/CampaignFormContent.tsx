"use client";

import { useCampaignForm } from "../contexts/CampaignFormContext";
import CampaignStepper from "./CampaignStepper";
import EventsSelection from "./events/EventsSelection";
import TemplateSelection from "./TemplateSelection";
import DetailsSection from "./details/DetailsSection";

const CampaignFormContent = () => {
  const { currentStep } = useCampaignForm();

  return (
    <div className="max-w-4xl mx-auto">
      <CampaignStepper />
      {currentStep === "event" && <EventsSelection />}
      {currentStep === "template" && <TemplateSelection />}
      {currentStep === "details" && <DetailsSection />}
    </div>
  );
};

export default CampaignFormContent;
