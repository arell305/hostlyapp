"use client";

import SearchInput from "@/features/events/components/SearchInput";
import SectionContainer from "@/shared/ui/containers/SectionContainer";
import ToggleTabs from "@/shared/ui/toggle/ToggleTabs";
import { useRef, useState } from "react";
import NoEventSelected from "./NoEventSelected";
import EventListForCampaignLoader from "./EventListForCampaignLoader";
import { EventFilter } from "@/shared/types/types";

const EventsSelection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedTab, setSelectedTab] = useState<EventFilter>("upcoming");

  const showSearchInput = selectedTab === "upcoming" || selectedTab === "past";

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
    </SectionContainer>
  );
};

export default EventsSelection;
