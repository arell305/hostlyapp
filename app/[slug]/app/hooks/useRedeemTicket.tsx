import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { ResponseStatus } from "@/types/enums";
const useRedeemTicket = () => {
  const [redeemTicketError, setRedeemTicketError] = useState<string | null>(
    null
  );
  const [isRedeemTicketLoading, setIsRedeemTicketLoading] =
    useState<boolean>(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");

  const checkInTicket = useMutation(api.tickets.checkInTicket);

  const handleRedeem = async (): Promise<boolean> => {
    setRedeemTicketError(null);

    if (selectedTicketId.trim() === "") {
      setRedeemTicketError("No ticket selected");
      return false;
    }

    setIsRedeemTicketLoading(true);
    try {
      const response = await checkInTicket({
        ticketUniqueId: selectedTicketId,
      });

      if (response.status === ResponseStatus.SUCCESS) {
        setSelectedTicketId("");
        return true;
      } else {
        console.error("Error redeeming ticket", response.error);
        setRedeemTicketError(response.error);
        return false;
      }
    } catch (error) {
      console.error("Error redeeming ticket", error);
      setRedeemTicketError("Error Redeeming Ticket");
      return false;
    } finally {
      setIsRedeemTicketLoading(false);
    }
  };

  return {
    redeemTicketError,
    isRedeemTicketLoading,
    selectedTicketId,
    setSelectedTicketId,
    handleRedeem,
    setRedeemTicketError,
  };
};

export default useRedeemTicket;
