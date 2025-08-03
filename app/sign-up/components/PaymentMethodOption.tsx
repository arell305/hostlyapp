import React from "react";

interface PaymentMethodOptionProps {
  label: string;
  icon: React.ReactNode;
  value: "card" | "apple";
  selected: "card" | "apple";
  onSelect: (method: "card" | "apple") => void;
}

const PaymentMethodOption: React.FC<PaymentMethodOptionProps> = ({
  label,
  icon,
  value,
  selected,
  onSelect,
}) => {
  const isSelected = selected === value;

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={() => onSelect(value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(value);
      }}
      className={`p-4 border rounded-lg cursor-pointer hover:bg-cardBackgroundHover w-[120px] focus:outline-none focus:ring-2 focus:ring-primaryBlue ${
        isSelected ? "border-primaryBlue" : "border"
      }`}
    >
      <div className="mb-2">{icon}</div>
      <div>{label}</div>
    </div>
  );
};

export default PaymentMethodOption;
