import { useContextOrganization } from "@/contexts/OrganizationContext";
import { useEventsForCampaign } from "@/domain/events";
import { EventFilterWithoutNone } from "@/shared/types/types";
import CampaignEvents from "./CampaignEvents";

interface EventListForCampaignLoaderProps {
  eventFilter: EventFilterWithoutNone;
  searchTerm: string;
}
const EventListForCampaignLoader: React.FC<EventListForCampaignLoaderProps> = ({
  eventFilter,
  searchTerm,
}) => {
  const { organization } = useContextOrganization();
  const events = useEventsForCampaign(
    organization._id,
    eventFilter,
    searchTerm
  );

  const showDirections = eventFilter === "past" && searchTerm.length < 3;

  if (showDirections) {
    return (
      <div className="text-muted-foreground ">
        Please enter at least 3 characters to search for past events.
      </div>
    );
  }

  if (!events) {
    return;
  }

  return <CampaignEvents events={events} />;
};

export default EventListForCampaignLoader;
