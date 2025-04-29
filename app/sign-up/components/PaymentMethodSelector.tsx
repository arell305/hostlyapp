import { Label } from "@/components/ui/label";
import { FaApple, FaCreditCard } from "react-icons/fa";
import PaymentMethodOption from "./PaymentMethodOption";

interface PaymentMethodSelectorProps {
  selected: "card" | "apple";
  onSelect: (method: "card" | "apple") => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <>
      <Label className="block text-sm font-medium mb-2">Payment Method</Label>
      <div className="flex space-x-4 mt-2 mb-8">
        <PaymentMethodOption
          label="Card"
          icon={<FaCreditCard />}
          value="card"
          selected={selected}
          onSelect={onSelect}
        />
        <PaymentMethodOption
          label="Apple Pay"
          icon={<FaApple />}
          value="apple"
          selected={selected}
          onSelect={onSelect}
        />
      </div>
    </>
  );
};

export default PaymentMethodSelector;
