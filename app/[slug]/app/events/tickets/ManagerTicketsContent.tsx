import React, { useMemo, useState } from "react";
import { Promoter } from "../../../../../../app/types/types";
import {
  TicketInfoSchema,
  TicketSchemaWithPromoter,
} from "@/types/schemas-types";
import { Id } from "../../../../../../convex/_generated/dataModel";
import TotalTicketSales from "../../components/tickets/TotalTicketSales";
import PromoterTicketSales from "../../components/tickets/PromoterTicketSales";
import TicketList from "../../components/tickets/TicketList";
import {
  countTicketsByGender,
  countTicketsByGenderWithPromoter,
  filterTicketsByPromoter,
} from "../../../../../utils/format";

interface ManagerTicketsContentProps {
  promoters: Promoter[];
  tickets: TicketSchemaWithPromoter[];
  isTicketsSalesOpen: boolean;
  ticketData: TicketInfoSchema;
}

const ManagerTicketsContent: React.FC<ManagerTicketsContentProps> = ({
  promoters,
  tickets,
  isTicketsSalesOpen,
  ticketData,
}) => {
  const [selectedPromoterId, setSelectedPromoterId] = useState<
    Id<"users"> | "all"
  >("all");

  const { maleTickets, femaleTickets } = useMemo(() => {
    return countTicketsByGender(tickets);
  }, [tickets]);

  const { maleTicketsWithPromoter, femaleTicketsWithPromoter } = useMemo(() => {
    return countTicketsByGenderWithPromoter(tickets, selectedPromoterId);
  }, [tickets, selectedPromoterId]);

  const filteredTickets = useMemo(() => {
    return filterTicketsByPromoter(tickets, selectedPromoterId);
  }, [tickets, selectedPromoterId]);

  return (
    <div className="mb-4 flex flex-col gap-4 bg-gray-100 min-h-[100vh]">
      <TotalTicketSales
        isTicketsSalesOpen={isTicketsSalesOpen}
        ticketData={ticketData}
        maleTickets={maleTickets}
        femaleTickets={femaleTickets}
      />
      <PromoterTicketSales
        setSelectedPromoterId={setSelectedPromoterId}
        promoters={promoters}
        maleTicketsWithPromoter={maleTicketsWithPromoter}
        femaleTicketsWithPromoter={femaleTicketsWithPromoter}
      />
      <TicketList tickets={filteredTickets} canCheckInTickets={false} />
    </div>
  );
};

export default ManagerTicketsContent;
