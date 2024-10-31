"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  text?: string;
  targetRoute?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  text = "Back",
  targetRoute,
}) => {
  const router = useRouter();

  const handleBackClick = () => {
    if (targetRoute) {
      router.push(targetRoute); // Navigate to the specified route
    } else {
      router.back(); // Default to going back
    }
  };

  return (
    <span
      onClick={handleBackClick}
      className="mb-4 cursor-pointer text-blue-500 hover:underline"
    >
      {text}
    </span>
  );
};

export default BackButton;
