"use client";
import { useState } from "react";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { ResponseStatus } from "@/types/enums";
import IconButton from "@/components/shared/buttonContainers/IconButton";
import { X } from "lucide-react";
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
      let ticketId: string | undefined;

      try {
        const parsedData = JSON.parse(qrData);
        ticketId = parsedData?.ticketUniqueId;
      } catch {
        // fallback if it's a plain string
        ticketId = qrData;
      }

      if (ticketId) {
        const response = await checkInTicket({ ticketUniqueId: ticketId });

        if (response.status === ResponseStatus.SUCCESS) {
          setCheckInStatus("✅ Check-in successful!");
        } else {
          setCheckInStatus(`❌ Check-in failed: ${response.error}`);
        }
      } else {
        setCheckInStatus("❌ Invalid QR code format");
      }
    } catch (error) {
      console.error(error);
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
      <DrawerContent className="fixed inset-x-0 bottom-0 h-[100vh]  rounded-t-lg  flex flex-col">
        <IconButton
          onClick={onClose}
          className="absolute top-4 right-4"
          variant="outline"
          icon={<X />}
        />
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
      </DrawerContent>
    </Drawer>
  );
};

export default TicketScannerModal;
