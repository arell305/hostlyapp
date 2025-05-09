import React from "react";
import { cn } from "@/lib/utils"; // optional: for combining class names

interface InitialAvatarProps {
  initial: string;
  size?: number; // e.g. 80 → 80px width/height
  textSize?: string; // e.g. "text-xl" or "text-3xl"
  bgColor?: string; // optional tailwind class, e.g. "bg-gray-400"
  className?: string;
}

const InitialAvatar: React.FC<InitialAvatarProps> = ({
  initial,
  size = 80,
  textSize = "text-xl",
  bgColor = "bg-gray-600",
  className = "",
}) => {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white",
        bgColor,
        textSize,
        className
      )}
      style={{ width: size, height: size }}
    >
      {initial}
    </div>
  );
};

export default InitialAvatar;
