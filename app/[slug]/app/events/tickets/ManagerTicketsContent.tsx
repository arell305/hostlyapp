import React, { useMemo, useState } from "react";
import { Promoter } from "../../../../../../app/types/types";
import {
  TicketInfoSchema,
  TicketSchemaWithPromoter,
} from "@/types/schemas-types";
import { Id } from "../../../../../../convex/_generated/dataModel";
import PromoterTicketSales from "../../components/tickets/PromoterTicketSales";
import TicketList from "../../components/tickets/TicketList";
import {
  countTicketsByGender,
  countTicketsByGenderWithPromoter,
  filterTicketsByPromoter,
} from "../../../../../utils/format";

interface ManagerTicketsContentProps {
  tickets: TicketSchemaWithPromoter[];
}

const ManagerTicketsContent: React.FC<ManagerTicketsContentProps> = ({
  tickets,
}) => {
  return (
    <div className="mb-4 flex flex-col gap-4 min-h-[100vh]">
      <TicketList tickets={tickets} canCheckInTickets={false} />
    </div>
  );
};

export default ManagerTicketsContent;
