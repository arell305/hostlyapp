import { FaApple, FaCreditCard } from "react-icons/fa";

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
      <label className="block text-sm font-medium mb-2">Payment Method</label>
      <div className="flex space-x-4 mt-2 mb-8">
        <div
          onClick={() => onSelect("card")}
          className={`p-4 border rounded-lg cursor-pointer ${
            selected === "card"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300"
          }`}
        >
          <FaCreditCard className="mb-2" />
          Card
        </div>
        <div
          onClick={() => onSelect("apple")}
          className={`p-4 border rounded-lg cursor-pointer ${
            selected === "apple"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300"
          }`}
        >
          <FaApple className="mb-2" />
          Apple Pay
        </div>
      </div>
    </>
  );
};

export default PaymentMethodSelector;
