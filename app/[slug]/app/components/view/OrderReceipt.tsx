import { Button } from "@/components/ui/button";

interface OrderReceiptProps {
  onBrowseMoreEvents: () => void;
}

const OrderReceipt: React.FC<OrderReceiptProps> = ({ onBrowseMoreEvents }) => (
  <div className="flex flex-col bg-white rounded border border-altGray w-[95%] mx-auto shadow mb-4 py-3 px-7">
    <div className="mt-4 ">
      <h2 className="mb-2 text-2xl font-bold ">Success!</h2>
      <div className="mt-1 mb-4">
        <p className="text-sm 3">
          You will an email with your tickets. Thank you for your purchase!
        </p>
      </div>
    </div>

    <div className=" p-3 mb-4">
      <Button className="w-full" onClick={onBrowseMoreEvents}>
        Browse More Events
      </Button>
    </div>
  </div>
);

export default OrderReceipt;
