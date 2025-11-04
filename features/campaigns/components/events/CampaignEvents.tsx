import { Doc, Id } from "@/convex/_generated/dataModel";
import CampaignEventCard from "./CampaignEventCard";
import { useCampaignForm } from "../../contexts/CampaignFormContext";

interface CampaignEventsProps {
  events: Doc<"events">[];
}

const CampaignEvents: React.FC<CampaignEventsProps> = ({ events }) => {
  const { updateFormData, nextStep } = useCampaignForm();

  const handleEventSelect = (eventId: Id<"events">) => {
    updateFormData({ eventId });
    nextStep();
  };

  const hasEvents = events.length > 0;

  if (!hasEvents) {
    return <div>No events found</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {events.map((event) => (
        <CampaignEventCard
          key={event._id}
          event={event}
          onSelect={handleEventSelect}
        />
      ))}
    </div>
  );
};

export default CampaignEvents;
