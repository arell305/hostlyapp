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
      className="cursor-pointer text-customDarkBlue font-semibold hover:underline font-raleway text-base"
    >
      {text}
    </span>
  );
};

export default BackButton;
