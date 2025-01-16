import { EventData, EventSchema, TicketInfo } from "@/types/types";
import React from "react";
import About from "../components/view/About";
import TicketView from "../components/view/Tickets";
import DetailsView from "../components/view/DetailsView";

interface ViewTabProps {
  eventData: EventSchema;
  ticketData?: TicketInfo | null;
}
const ViewTab: React.FC<ViewTabProps> = ({ eventData, ticketData }) => {
  return (
    <div className="flex flex-col justify-center items-center space-y-4 bg-gray-100 pb-4 pt-4">
      <DetailsView eventData={eventData} />
      <About description={eventData.description} />
      <TicketView ticketData={ticketData} />
    </div>
  );
};

export default ViewTab;
