"use client";

import SectionContainer from "@/shared/ui/containers/SectionContainer";
import { useCreateCampaignForm } from "../../contexts/CampaignFormContext";
import FormActions from "@/shared/ui/buttonContainers/FormActions";
import SectionBodyContainer from "@/shared/ui/containers/SectionBodyContainer";
import EventsSelectionContent from "./EventsSelectionContent";
import EventSelected from "./EventSelected";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import { ArrowLeftIcon } from "lucide-react";

interface EventsSelectionProps {
  triggerCancelModal: () => void;
}

const EventsSelection: React.FC<EventsSelectionProps> = ({
  triggerCancelModal,
}) => {
  const { nextStep, formData, updateFormData } = useCreateCampaignForm();

  const isNextDisabled = formData.eventId === undefined;

  const isEventSelected = !!formData.eventId;

  const handleBack = () => {
    updateFormData({ eventId: undefined });
  };

  return (
    <SectionContainer className="gap-0">
      <SectionBodyContainer>
        <div className="flex items-center gap-x-1">
          {isEventSelected && (
            <IconButton
              icon={<ArrowLeftIcon className="size-4" />}
              onClick={handleBack}
            />
          )}
          <h2>Choose Event for Campaign</h2>
        </div>

        {isEventSelected ? <EventSelected /> : <EventsSelectionContent />}
      </SectionBodyContainer>
      <FormActions
        onCancel={triggerCancelModal}
        onSubmit={nextStep}
        isSubmitDisabled={isNextDisabled}
        isLoading={false}
        error={null}
        cancelText="Cancel"
        submitText="Next"
        className="mt-16"
      />
    </SectionContainer>
  );
};

export default EventsSelection;
