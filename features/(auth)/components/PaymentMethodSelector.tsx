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
      <p id="payment-method-label" className="block font-medium">
        Payment Method
      </p>
      <div
        role="radiogroup"
        aria-labelledby="payment-method-label"
        className="flex space-x-4 mt-1 mb-8"
      >
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
