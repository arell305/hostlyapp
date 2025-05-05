import { useState } from "react";
import { QrCode } from "lucide-react";
import TicketScannerModal from "../drawer/TicketScannerDrawer";

const TicketScannerFAB = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-primaryBlue text-white p-4 rounded-full  hover:bg-blue-700 transition shadow shadow-glow-white"
      >
        <QrCode size={24} />
      </button>

      {/* Ticket Scanner Modal */}
      <TicketScannerModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default TicketScannerFAB;
