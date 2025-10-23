import { cn } from "@/shared/lib/utils";

interface InitialAvatarProps {
  initial: string;
  size?: number;
  textSize?: string;
  bgColor?: string;
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
