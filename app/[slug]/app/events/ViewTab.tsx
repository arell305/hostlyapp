import React from "react";
import About from "../components/view/About";
import TicketView from "../components/view/Tickets";
import DetailsView from "../components/view/DetailsView";
import { EventSchema, EventTicketTypesSchema } from "@/types/schemas-types";
import SectionContainer from "@/components/shared/containers/SectionContainer";

interface ViewTabProps {
  eventData: EventSchema;
  ticketData?: EventTicketTypesSchema[] | null;
}
const ViewTab: React.FC<ViewTabProps> = ({ eventData, ticketData }) => {
  const showTicket = ticketData && ticketData.length > 0;
  return (
    <SectionContainer className="flex flex-col gap-x-2 mt-4">
      <DetailsView eventData={eventData} />
      <About description={eventData.description} />
      {showTicket && <TicketView ticketData={ticketData} />}
    </SectionContainer>
  );
};

export default ViewTab;
