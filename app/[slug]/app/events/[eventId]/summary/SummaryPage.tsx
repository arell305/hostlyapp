import {
  GuestListInfoSchema,
  TicketInfoSchema,
  TicketSchemaWithPromoter,
} from "@/types/schemas-types";
import React from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { handleQueryState } from "../../../../../../utils/handleQueryState";
import { QueryState } from "@/types/enums";
import { Promoter } from "@/types/types";
import SummaryContent from "./SummaryContent";

interface SummaryPageProps {
  guestListInfo?: GuestListInfoSchema | null;
  ticketData?: TicketInfoSchema | null;
  tickets: TicketSchemaWithPromoter[];
  organizationId: Id<"organizations">;
}

const SummaryPage: React.FC<SummaryPageProps> = ({
  guestListInfo,
  ticketData,
  tickets,
  organizationId,
}) => {
  const responsePromoters = useQuery(api.organizations.getPromotersByOrg, {
    organizationId,
  });

  const resultPromoters = handleQueryState(responsePromoters);

  if (
    resultPromoters.type === QueryState.Loading ||
    resultPromoters.type === QueryState.Error
  ) {
    return resultPromoters.element;
  }

  const promoters: Promoter[] = resultPromoters.data.promoters;

  return (
    <SummaryContent
      guestListInfo={guestListInfo}
      ticketData={ticketData}
      tickets={tickets}
      promoters={promoters}
    />
  );
};

export default SummaryPage;
