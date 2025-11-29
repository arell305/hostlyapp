import { MessageCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface NotificationIconProps {
  count?: number;
  className?: string;
  onClick?: () => void;
}

export function NotificationIcon({
  count,
  className,
  onClick,
}: NotificationIconProps) {
  const hasNotifications = count !== undefined && count > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center focus:outline-none  rounded-full ",
        onClick && "cursor-pointer",
        className
      )}
    >
      <MessageCircle className="text-gray-400 w-6 h-6" />

      {hasNotifications && (
        <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px- rounded-full bg-red-600 text-white text-xs font-medium">
          {count > 99 ? "99+" : count}
        </div>
      )}
    </button>
  );
}
