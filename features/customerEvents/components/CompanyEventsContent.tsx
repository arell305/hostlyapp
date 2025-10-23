"use client";

import _ from "lodash";
import { EventWithTicketTypes } from "@shared/types/schemas-types";
import HomeNav from "@/shared/ui/nav/HomeNav";
import EventGrid from "@/shared/ui/containers/EventGrid";
import SectionContainer from "@/shared/ui/containers/SectionContainer";
import ProfileBanner from "@/shared/ui/company/ProfileBanner";
import EmptyList from "@/shared/ui/list/EmptyList";
import EventPreview from "./EventPreview";

interface CompanyEventsContentProps {
  displayCompanyPhoto: string | null | undefined;
  name: string;
  events: EventWithTicketTypes[];
  handleNavigateEvent: (eventId: string) => void;
}

const CompanyEventsContent: React.FC<CompanyEventsContentProps> = ({
  displayCompanyPhoto,
  name,
  events,
  handleNavigateEvent,
}) => {
  return (
    <div>
      <HomeNav />
      <main>
        <SectionContainer>
          <ProfileBanner displayPhoto={displayCompanyPhoto} name={name} />
          <EmptyList items={events} message="No events found" />
          <EventGrid>
            {events.map((event: EventWithTicketTypes) => (
              <EventPreview
                key={event._id}
                eventData={event}
                handleNavigateEvent={handleNavigateEvent}
              />
            ))}
          </EventGrid>
        </SectionContainer>
      </main>
    </div>
  );
};

export default CompanyEventsContent;
