"use client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ResponseStatus } from "../../../../../utils/enum";

const TicketScannerModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [checkInStatus, setCheckInStatus] = useState<string | null>(null);

  const checkInTicket = useMutation(api.tickets.checkInTicket);

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (!detectedCodes.length) return;

    try {
      const qrData = detectedCodes[0].rawValue;
      const parsedData = JSON.parse(qrData);

      if (parsedData?.ticketUniqueId) {
        const response = await checkInTicket({
          ticketUniqueId: parsedData.ticketUniqueId,
        });

        if (response.status === ResponseStatus.SUCCESS) {
          setCheckInStatus("✅ Check-in successful!");
        } else {
          setCheckInStatus(`❌ Check-in failed: ${response.error}`);
        }
      } else {
        setCheckInStatus("❌ Invalid QR code format");
      }
    } catch (error) {
      setCheckInStatus("❌ Error parsing QR code");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setCheckInStatus(null);
        onClose();
      }}
    >
      <DialogContent className="fixed inset-0 w-full h-full flex flex-col bg-white p-6">
        <DialogTitle className="text-center text-2xl font-bold">
          Scan Ticket
        </DialogTitle>

        <div className="flex-grow flex items-center justify-center">
          <Scanner
            onScan={handleScan}
            constraints={{ facingMode: "environment" }}
            paused={false}
          />
        </div>

        {checkInStatus && (
          <p className="text-center text-lg font-semibold mt-4 text-gray-700">
            {checkInStatus}
          </p>
        )}

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-3/4">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketScannerModal;
