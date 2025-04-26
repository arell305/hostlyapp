import { TicketCounts } from "@/types/types";
import React from "react";
import { TbCircleLetterF } from "react-icons/tb";
import { TbCircleLetterM } from "react-icons/tb";

interface PromoterTicketsContentProps {
  ticketCounts: TicketCounts;
}
const PromoterTicketsContent = ({
  ticketCounts,
}: PromoterTicketsContentProps) => {
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

export default PromoterTicketsContent;
