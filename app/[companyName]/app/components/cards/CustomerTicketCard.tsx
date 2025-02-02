import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CustomerTicket } from "@/types/schemas-types";
import { QRCodeCanvas } from "qrcode.react";
import _ from "lodash";
import { Badge } from "@/components/ui/badge";
import { MdOutlineCalendarToday } from "react-icons/md";
import { formatDateMDY, formatTime } from "../../../../../utils/helpers";
import { FiClock } from "react-icons/fi";
import { LuMapPin } from "react-icons/lu";

interface CustomerTicketCardProps {
  ticket: CustomerTicket;
}

const CustomerTicketCard: React.FC<CustomerTicketCardProps> = ({ ticket }) => {
  const { name, startTime, endTime, address, gender, ticketUniqueId } = ticket;

  const handleAddressClick = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <Card className="shadow-lg rounded-2xl relative">
      <CardContent className="flex flex-col items-start space-y-3 ">
        <h2 className="text-2xl font-bold text-center w-full mb-2 mt-2 pt-2">
          Value Promotions
        </h2>
        <div className="mt-4 flex justify-center w-full">
          <QRCodeCanvas value={ticketUniqueId} size={100} />
        </div>
        <div className="text-lg font-semibold w-full px-4">{name}</div>{" "}
        <div className="text-sm flex space-x-1.5 px-4">
          <MdOutlineCalendarToday className="text-xl" />
          <p>{formatDateMDY(startTime)}</p>
        </div>
        <div className="text-sm flex space-x-1.5 px-4 ">
          <FiClock className="text-xl" />
          <p>{`${formatTime(startTime)} - ${formatTime(endTime)}`} </p>
        </div>
        <div
          className="px-4 text-sm flex space-x-1.5 cursor-pointer underline hover:text-blue-700 hover:underline border-b pb-4"
          onClick={handleAddressClick}
        >
          {" "}
          <LuMapPin className="text-xl flex-shrink-0" />
          <p>{address}</p>
        </div>
        <CardFooter className="text-sm justify-between  flex w-full mt-4 font-medium px-5 pt-2 pb-5">
          <p>Ticket ID: {ticketUniqueId}</p>
          <p>{_.capitalize(gender)}</p>
        </CardFooter>
      </CardContent>
    </Card>
  );
};

export default CustomerTicketCard;
