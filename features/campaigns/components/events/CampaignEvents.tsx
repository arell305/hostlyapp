import { Doc, Id } from "@/convex/_generated/dataModel";
import CampaignEventCard from "./CampaignEventCard";
import { useCampaignForm } from "../../contexts/CampaignFormContext";
import CappedCardList from "@/shared/ui/containers/CappedCardList";

interface CampaignEventsProps {
  events: Doc<"events">[];
}

const CampaignEvents: React.FC<CampaignEventsProps> = ({ events }) => {
  const { updateFormData, nextStep, formData } = useCampaignForm();

  const handleEventSelect = (eventId: Id<"events">) => {
    updateFormData({ eventId });
    nextStep();
  };

  const hasEvents = events.length > 0;

  if (!hasEvents) {
    return <div>No events found</div>;
  }

  return (
    <CappedCardList>
      {events.map((event) => (
        <CampaignEventCard
          isSelected={formData.eventId === event._id}
          key={event._id}
          event={event}
          onSelect={handleEventSelect}
        />
      ))}
    </CappedCardList>
  );
};

export default CampaignEvents;
