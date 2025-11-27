import SearchInput from "@/features/events/components/SearchInput";
import ToggleTabs from "@/shared/ui/toggle/ToggleTabs";
import EventListForCampaignLoader from "./EventListForCampaignLoader";
import NoEventSelected from "./NoEventSelected";
import { EventFilter } from "@/shared/types/types";
import { useState, useRef } from "react";
import { useCreateCampaignForm } from "../../contexts/CampaignFormContext";

const EventsSelectionContent = () => {
  const { updateFormData, setHasGuestList, setTemplateMode } =
    useCreateCampaignForm();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedTab, setSelectedTab] = useState<EventFilter>("upcoming");

  const showSearchInput = selectedTab === "upcoming" || selectedTab === "past";

  const handleTabChange = (value: EventFilter) => {
    setSelectedTab(value);
    setTemplateMode("list");

    if (value === "none") {
      updateFormData({
        eventId: null,
        audienceType: "All Contacts",
        body: null,
        templateId: null,
      });
      setHasGuestList(false);
    } else {
      updateFormData({ eventId: undefined });
    }
  };

  return (
    <>
      <ToggleTabs
        options={[
          { label: "Upcoming", value: "upcoming" },
          { label: "Past", value: "past" },
          { label: "None", value: "none" },
        ]}
        value={selectedTab}
        onChange={handleTabChange}
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
    </>
  );
};

export default EventsSelectionContent;
