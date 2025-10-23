"use client";

import CustomCard from "@/shared/ui/cards/CustomCard";
import { Button } from "@/shared/ui/primitive/button";

interface OrderReceiptProps {
  onBrowseMoreEvents: () => void;
}

const OrderReceipt: React.FC<OrderReceiptProps> = ({ onBrowseMoreEvents }) => (
  <CustomCard className="py-3 px-7 space-y-4 w-[95%] mx-auto ">
    <div className="">
      <h2 className="mb-2 text-2xl font-bold ">Success!</h2>
      <div className="mt-1 ">
        <p className="text-sm 3">
          You will receive an email with your tickets. Thank you for your
          purchase!
        </p>
      </div>
    </div>

    <div className=" p-3 mb-4">
      <Button className="w-full" onClick={onBrowseMoreEvents}>
        Browse More Events
      </Button>
    </div>
  </CustomCard>
);

export default OrderReceipt;
