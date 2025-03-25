import { EventData, TicketInfo } from "@/types/types";
import React from "react";
import About from "../components/view/About";
import TicketView from "../components/view/Tickets";
import DetailsView from "../components/view/DetailsView";
import { EventSchema, TicketInfoSchema } from "@/types/schemas-types";

interface ViewTabProps {
  eventData: EventSchema;
  ticketData?: TicketInfoSchema | null;
}
const ViewTab: React.FC<ViewTabProps> = ({ eventData, ticketData }) => {
  return (
    <div className="min-h-[100vh] flex flex-col items-center space-y-4 bg-gray-100 pb-20 pt-4">
      <DetailsView eventData={eventData} />
      <About description={eventData.description} />
      {ticketData && <TicketView ticketData={ticketData} />}
    </div>
  );
};

export default ViewTab;
