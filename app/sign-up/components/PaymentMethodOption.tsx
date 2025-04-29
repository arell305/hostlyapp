"use client";

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
  return (
    <div
      onClick={() => onSelect(value)}
      className={`p-4 border rounded-lg cursor-pointer hover:bg-cardBackgroundHover w-[120px] ${
        selected === value ? "border-primaryBlue" : "border"
      }`}
    >
      <div className="mb-2">{icon}</div>
      <div>{label}</div>
    </div>
  );
};

export default PaymentMethodOption;
