import { CustomerTicket } from "@/types/schemas-types";
import CustomerTicketCard from "../cards/CustomerTicketCard";
import { Button } from "@/components/ui/button";

interface OrderReceiptProps {
  onBrowseMoreEvents: () => void;
  //   purchasedTickets: CustomerTicket[];
}

const OrderReceipt: React.FC<OrderReceiptProps> = ({
  onBrowseMoreEvents,
  //   purchasedTickets,
}) => (
  <div className="flex flex-col bg-white rounded border border-altGray w-[400px] shadow mb-4">
    <div className="mt-4">
      <h2 className="mb-2 px-3  text-2xl font-bold text-center">
        Your Tickets
      </h2>
      <div className="mt-1 mb-4">
        <p className="text-sm px-3">
          You will also recieve an email with your tickets. Thank you for your
          purchase!
        </p>
      </div>
      {/* <div className="space-y-4 mx-3">
        {purchasedTickets.map((ticket: CustomerTicket) => (
          <CustomerTicketCard key={ticket.ticketUniqueId} ticket={ticket} />
        ))}
      </div> */}
    </div>

    <div className="mt-4 p-3 mb-4">
      <Button className="w-full" onClick={onBrowseMoreEvents}>
        Browse More Events
      </Button>
    </div>
  </div>
);

export default OrderReceipt;
