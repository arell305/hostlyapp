"use client";
import { useState } from "react";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { ResponseStatus } from "@/types/enums";
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
    <Drawer
      open={open}
      onOpenChange={() => {
        setCheckInStatus(null);
        onClose();
      }}
    >
      <DrawerContent className="fixed inset-x-0 bottom-0 h-[100vh] bg-white rounded-t-lg shadow-lg flex flex-col">
        <DrawerTitle className="text-center text-2xl font-bold py-4">
          Scan Ticket
        </DrawerTitle>
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
      </DrawerContent>
    </Drawer>
  );
};

export default TicketScannerModal;
