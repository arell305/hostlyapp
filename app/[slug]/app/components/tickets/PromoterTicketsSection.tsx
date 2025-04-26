import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "../../../../../convex/_generated/dataModel";
import EventInfoSkeleton from "../loading/EventInfoSkeleton";
import SubErrorComponent from "../errors/SubErrorComponent";
import { TbCircleLetterF, TbCircleLetterM } from "react-icons/tb";
import { ResponseStatus } from "@/types/enums";
interface PromoterTicketsSectionProps {
  eventId: Id<"events">;
}

const PromoterTicketsSection: React.FC<PromoterTicketsSectionProps> = ({
  eventId,
}) => {
  const { user } = useUser();
  const response = useQuery(api.tickets.getTicketsByClerkUser, {
    eventId,
  });

  if (!user || !response) {
    return <EventInfoSkeleton />;
  }

  if (response.status === ResponseStatus.ERROR) {
    return <SubErrorComponent />;
  }

  const ticketCounts = response.data.ticketCounts;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Your Promo Code Usage</h3>
      <div className="flex">
        <TbCircleLetterM className="text-2xl pr-1" />
        <p className="mb-1">Male Tickets: {ticketCounts.male}</p>
      </div>
      <div className="flex">
        <TbCircleLetterF className="text-2xl pr-1" />
        <p>Female Tickets: {ticketCounts.female}</p>
      </div>
    </div>
  );
};

export default PromoterTicketsSection;

// To Be Deleted
