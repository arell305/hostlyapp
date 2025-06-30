import type { UserResource } from "@clerk/types";
import _ from "lodash";
import { EventSchema, EventWithTicketTypes } from "@/types/schemas-types";
import EventPreview from "./events/EventPreview";
import HomeNav from "./nav/HomeNav";
import ProfileBanner from "@/components/shared/company/ProfileBanner";
import EventGrid from "@/components/shared/containers/EventGrid";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import EmptyList from "@/components/shared/EmptyList";

interface CompanyEventsContentProps {
  user: UserResource | null;
  displayCompanyPhoto: string | null | undefined;
  handleNavigateHome: () => void;
  name: string;
  events: EventWithTicketTypes[];
  handleNavigateEvent: (eventId: string) => void;
}

const CompanyEventsContent: React.FC<CompanyEventsContentProps> = ({
  user,
  displayCompanyPhoto,
  handleNavigateHome,
  name,
  events,
  handleNavigateEvent,
}) => {
  return (
    <div>
      <HomeNav user={user} handleNavigateHome={handleNavigateHome} />
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
