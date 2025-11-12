import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { EventWithTicketTypes } from "@/types/schemas-types";
import { isTicketSalesOpen } from "@/lib/frontendHelper";
import CustomCard from "@/components/shared/cards/CustomCard";
import EventSummaryInfo from "./EventSummaryInfo";
import EventImageWithPlaceholder from "./EventImageWithPlaceholder";

interface EventPreviewProps {
  eventData: EventWithTicketTypes;
  handleNavigateEvent: (eventId: string) => void;
}

const EventPreview: React.FC<EventPreviewProps> = ({
  eventData,
  handleNavigateEvent,
}) => {
  const displayEventPhoto = useQuery(
    api.photo.getFileUrl,
    eventData.photo ? { storageId: eventData.photo } : "skip"
  );

  const isSalesOpen = isTicketSalesOpen(eventData.ticketTypes);

  return (
    <CustomCard
      className="
        hover:shadow-glow-white transition duration-200
        p-2 md:p-4
        w-[75%] md:w-full
        cursor-pointer
      "
      onClick={() => handleNavigateEvent(eventData._id)}
    >
      <div className="shadow-md rounded-md transition duration-200 bg-cardBackground">
        <div className="relative rounded-md w-full aspect-[9/16] overflow-hidden">
          {isSalesOpen && (
            <div className="absolute top-0 left-0 z-10">
              <span className="bg-cardBackgroundHover text-white text-sm font-semibold px-2 py-1 rounded">
                Tickets available
              </span>
            </div>
          )}
          <EventImageWithPlaceholder src={displayEventPhoto} />
        </div>

        <EventSummaryInfo
          name={eventData.name}
          startTime={eventData.startTime}
          address={eventData.address}
        />
      </div>
    </CustomCard>
  );
};

export default EventPreview;
