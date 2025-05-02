import type { UserResource } from "@clerk/types";
import _ from "lodash";
import { EventSchema } from "@/types/schemas-types";
import EventPreview from "./events/EventPreview";
import HomeNav from "./nav/HomeNav";
import ProfileBanner from "@/components/shared/company/ProfileBanner";
import EventGrid from "@/components/shared/containers/EventGrid";
import SectionContainer from "@/components/shared/containers/SectionContainer";

interface CompanyEventsContentProps {
  user: UserResource | null;
  displayCompanyPhoto: string | null | undefined;
  handleNavigateHome: () => void;
  name: string;
  events: EventSchema[];
}

const CompanyEventsContent: React.FC<CompanyEventsContentProps> = ({
  user,
  displayCompanyPhoto,
  handleNavigateHome,
  name,
  events,
}) => {
  return (
    <div>
      <HomeNav user={user} handleNavigateHome={handleNavigateHome} />
      <SectionContainer>
        <ProfileBanner displayPhoto={displayCompanyPhoto} name={name} />

        <EventGrid>
          {events.map((event: EventSchema) => (
            <EventPreview key={event._id} eventData={event} isApp={false} />
          ))}
        </EventGrid>
      </SectionContainer>
    </div>
  );
};

export default CompanyEventsContent;
