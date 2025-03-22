import { useQuery } from "convex/react";
import React, { useMemo, useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import EventInfoSkeleton from "../loading/EventInfoSkeleton";
import SubErrorComponent from "../errors/SubErrorComponent";
import { TicketInfoSchema, TicketSchema } from "@/types/schemas-types";
import { Gender, ResponseStatus } from "@/types/enums";
import TotalTicketSales from "./TotalTicketSales";
import PromoterTicketSales from "./PromoterTicketSales";
import TicketList from "./TicketList";

interface ManagerTicketsSectionProps {
  eventId: Id<"events">;
  organizationId: Id<"organizations">;
  ticketData: TicketInfoSchema;
  isTicketsSalesOpen: boolean;
}

const ManagerTicketsSection: React.FC<ManagerTicketsSectionProps> = ({
  eventId,
  organizationId,
  ticketData,
  isTicketsSalesOpen,
}) => {
  const [selectedPromoterId, setSelectedPromoterId] = useState<
    Id<"users"> | "all"
  >("all");

  const responsePromoters = useQuery(api.organizations.getPromotersByOrg, {
    organizationId,
  });
  const responseTickets = useQuery(api.tickets.getTicketsByEventId, {
    eventId,
  });
  const tickets = responseTickets?.data?.tickets;

  const promoters = responsePromoters?.data?.promoters;

  const { maleTickets, femaleTickets } = useMemo(() => {
    if (!tickets) {
      return { maleTickets: 0, femaleTickets: 0 };
    }
    return tickets.reduce(
      (acc, ticket: TicketSchema) => {
        if (ticket.gender === Gender.Male) {
          acc.maleTickets++;
        } else if (ticket.gender === Gender.Female) {
          acc.femaleTickets++;
        }
        return acc;
      },
      { maleTickets: 0, femaleTickets: 0 }
    );
  }, [tickets]);

  const { maleTicketsWithPromoter, femaleTicketsWithPromoter } = useMemo(() => {
    if (!tickets) {
      return { maleTicketsWithPromoter: 0, femaleTicketsWithPromoter: 0 };
    }
    return tickets.reduce(
      (acc, ticket: TicketSchema) => {
        const isValidPromoter = ticket.promoterUserId !== null;
        const isMatchingPromoter =
          selectedPromoterId === "all"
            ? isValidPromoter
            : ticket.promoterUserId === selectedPromoterId;

        if (isMatchingPromoter) {
          if (ticket.gender === Gender.Male) {
            acc.maleTicketsWithPromoter++;
          } else if (ticket.gender === Gender.Female) {
            acc.femaleTicketsWithPromoter++;
          }
        }
        return acc;
      },
      { maleTicketsWithPromoter: 0, femaleTicketsWithPromoter: 0 }
    );
  }, [selectedPromoterId, tickets]);

  const filteredTickets = useMemo(() => {
    if (!tickets) {
      return [];
    }
    return tickets.filter(
      (ticket) =>
        selectedPromoterId === "all" ||
        ticket.promoterUserId === selectedPromoterId
    );
  }, [selectedPromoterId, tickets]);

  if (!promoters || !responseTickets) {
    return <EventInfoSkeleton />;
  }

  if (
    responsePromoters.status === ResponseStatus.ERROR ||
    responseTickets.status === ResponseStatus.ERROR
  ) {
    return <SubErrorComponent />;
  }

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

export default ManagerTicketsSection;
