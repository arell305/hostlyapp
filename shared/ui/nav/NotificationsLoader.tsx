"use client";
import { useTotalRepliesNeeded } from "@/domain/smsThreads/useTotalRepliesNeeded";
import { NotificationIcon } from "../icons/NotificationIcon";
import AvatarSkeleton from "../skeleton/AvatarSkeleton";

interface NotificationsLoaderProps {
  onClick: () => void;
}
const NotificationsLoader = ({ onClick }: NotificationsLoaderProps) => {
  const totalRepliesNeeded = useTotalRepliesNeeded();

  if (totalRepliesNeeded === undefined) {
    return <AvatarSkeleton className="h-8 w-8" />;
  }

  return <NotificationIcon count={totalRepliesNeeded} onClick={onClick} />;
};

export default NotificationsLoader;
