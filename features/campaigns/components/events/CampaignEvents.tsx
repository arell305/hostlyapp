"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import CampaignEventCard from "./CampaignEventCard";
import { useCreateCampaignForm } from "../../contexts/CampaignFormContext";
import CappedCardList from "@/shared/ui/containers/CappedCardList";

interface CampaignEventsProps {
  events: Doc<"events">[];
}

const CampaignEvents: React.FC<CampaignEventsProps> = ({ events }) => {
  const { updateFormData, formData, setTemplateMode } = useCreateCampaignForm();

  const handleEventSelect = (eventId: Id<"events">) => {
    setTemplateMode("list");
    if (formData.eventId === eventId) {
      updateFormData({ eventId: undefined });
    } else {
      updateFormData({ eventId, body: null, templateId: null });
    }
  };

  const hasEvents = events.length > 0;

  if (!hasEvents) {
    return <div className=" text-grayText">No events found.</div>;
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
        </div>
      ))}
    </CappedCardList>
  );
};

export default CampaignEvents;
