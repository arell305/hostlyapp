import { Doc, Id } from "@/convex/_generated/dataModel";
import CampaignEventCard from "./CampaignEventCard";
import { useCampaignForm } from "../../contexts/CampaignFormContext";
import CappedCardList from "@/shared/ui/containers/CappedCardList";
import EventDetailsLoader from "./EventDetailsLoader";

interface CampaignEventsProps {
  events: Doc<"events">[];
}

const CampaignEvents: React.FC<CampaignEventsProps> = ({ events }) => {
  const { updateFormData, formData } = useCampaignForm();

  const handleEventSelect = (eventId: Id<"events">) => {
    if (formData.eventId === eventId) {
      updateFormData({ eventId: undefined });
    } else {
      updateFormData({ eventId });
    }
  };

  const hasEvents = events.length > 0;

  if (!hasEvents) {
    return <div>No events found</div>;
  }

  return (
    <CappedCardList>
      {events.map((event) => (
        <div key={event._id} className="w-full flex flex-col">
          <CampaignEventCard
            isSelected={formData.eventId === event._id}
            key={event._id}
            event={event}
            onSelect={handleEventSelect}
          />
          {formData.eventId === event._id && (
            <EventDetailsLoader eventId={event._id} />
          )}
        </div>
      ))}
    </CappedCardList>
  );
};

export default CampaignEvents;
