import { cn } from "@/shared/lib/utils";
import { Sparkles } from "lucide-react";

interface InitialAvatarProps {
  initial?: string;
  isAI?: boolean;
  size?: number;
  bgColor?: string;
  className?: string;
  textSize?: string;
}

const InitialAvatar: React.FC<InitialAvatarProps> = ({
  initial = "?",
  isAI = false,
  size = 32,
  bgColor = "bg-gray-600",
  className,
  textSize = "text-xs",
}) => {
  if (isAI) {
    return (
      <div
        className={cn(
          "rounded-full bg-purple-600/20 flex items-center justify-center shrink-0",
          className
        )}
        style={{ width: size, height: size }}
      >
        <Sparkles className="h-[55%] w-[55%] text-purple-400" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shrink-0",
        textSize,
        bgColor,
        className
      )}
      style={{ width: size, height: size }}
    >
      {initial}
    </div>
  );
};

export default InitialAvatar;
