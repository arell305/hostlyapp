import { TicketInfoSchema } from "@/types/schemas-types";
import React from "react";
import { FiClock } from "react-icons/fi";
import { TbCircleLetterM, TbCircleLetterF } from "react-icons/tb";
import { formatToTimeAndShortDate } from "../../../../../utils/luxon";

interface TotalTicketSalesProps {
  isTicketsSalesOpen: boolean;
  ticketData: TicketInfoSchema;
  maleTickets: number;
  femaleTickets: number;
}

const TotalTicketSales: React.FC<TotalTicketSalesProps> = ({
  isTicketsSalesOpen,
  ticketData,
  maleTickets,
  femaleTickets,
}) => {
  return (
    <div className="bg-white w-[95%] mx-auto px-4 pt-4 mt-4 rounded-md mb-4 shadow-md">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold pt-2 pb-3">Ticket Sales</h1>
        {!isTicketsSalesOpen && (
          <p className="text-red-700 font-semibold">Closed</p>
        )}
      </div>
      <div className="flex items-center space-x-3 py-3 border-b">
        <FiClock className="text-2xl text-gray-900" />
        <p>
          {isTicketsSalesOpen ? "Ticket Sales Ends:" : "Ticket Sales Ended"}{" "}
          <span className="text-gray-700 font-semibold">
            {formatToTimeAndShortDate(ticketData.ticketSalesEndTime)}
          </span>
        </p>
      </div>
      <div className="flex items-center space-x-3 py-3 border-b">
        <TbCircleLetterM className="text-2xl" />
        <p>
          Male Tickets Sold:{" "}
          <span className="text-gray-700 font-semibold">
            {maleTickets} / {ticketData.ticketTypes.male.capacity}
          </span>
        </p>
      </div>
      <div className="flex items-center space-x-3 py-3">
        <TbCircleLetterF className="text-2xl" />
        <p>
          Female Tickets Sold:{" "}
          <span className="text-gray-700 font-semibold">
            {femaleTickets} / {ticketData.ticketTypes.female.capacity}
          </span>
        </p>
      </div>
    </div>
  );
};

export default TotalTicketSales;
