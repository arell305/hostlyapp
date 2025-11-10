"use client";

import SearchInput from "@/features/events/components/SearchInput";
import SectionContainer from "@/shared/ui/containers/SectionContainer";
import ToggleTabs from "@/shared/ui/toggle/ToggleTabs";
import { useRef, useState } from "react";
import NoEventSelected from "./NoEventSelected";
import EventListForCampaignLoader from "./EventListForCampaignLoader";
import { EventFilter } from "@/shared/types/types";
import { useCampaignForm } from "../../contexts/CampaignFormContext";
import FormActions from "@/shared/ui/buttonContainers/FormActions";

interface EventsSelectionProps {
  triggerCancelModal: () => void;
}

const EventsSelection: React.FC<EventsSelectionProps> = ({
  triggerCancelModal,
}) => {
  const { nextStep, formData } = useCampaignForm();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedTab, setSelectedTab] = useState<EventFilter>("upcoming");

  const showSearchInput = selectedTab === "upcoming" || selectedTab === "past";

  const isNextDisabled = formData.eventId === null;

  return (
    <SectionContainer>
      <h2>Choose Event for Campaign</h2>

      <ToggleTabs
        options={[
          { label: "Upcoming", value: "upcoming" },
          { label: "Past", value: "past" },
          { label: "None", value: "none" },
        ]}
        value={selectedTab}
        onChange={setSelectedTab}
      />

      {showSearchInput ? (
        <>
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchInputRef={searchInputRef}
            placeholder="Search events..."
          />

          <EventListForCampaignLoader
            eventFilter={selectedTab}
            searchTerm={searchTerm}
          />
        </>
      ) : (
        <NoEventSelected />
      )}
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
