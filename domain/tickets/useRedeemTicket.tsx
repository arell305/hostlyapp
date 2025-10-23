import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import { setErrorFromConvexError } from "@shared/lib/errorHelper";

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
      await checkInTicket({
        ticketUniqueId: selectedTicketId,
      });

      setSelectedTicketId("");
      return true;
    } catch (error) {
      setErrorFromConvexError(error, setRedeemTicketError);

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
