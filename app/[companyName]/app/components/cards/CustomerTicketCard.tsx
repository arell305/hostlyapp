import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerTicket } from "@/types/schemas-types";
import { QRCodeCanvas } from "qrcode.react";

interface CustomerTicketCardProps {
  ticket: CustomerTicket;
}

const CustomerTicketCard: React.FC<CustomerTicketCardProps> = ({ ticket }) => {
  const { name, startTime, endTime, address, gender, ticketUniqueId } = ticket;

  return (
    <Card className="p-4 shadow-lg rounded-2xl">
      <CardContent className="flex flex-col items-start space-y-4">
        <div className="text-lg font-semibold">{name}</div>
        <div className="text-sm text-gray-500">
          <strong>Start:</strong> {new Date(startTime).toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">
          <strong>End:</strong> {new Date(endTime).toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">
          <strong>Address:</strong> {address}
        </div>
        <div className="text-sm text-gray-500">
          <strong>Gender:</strong> {gender}
        </div>
        <div className="mt-4 flex justify-center w-full">
          <QRCodeCanvas value={ticketUniqueId} size={100} />{" "}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerTicketCard;
