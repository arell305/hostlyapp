"use client";

import InitialAvatar from "@/shared/ui/avatars/InitialAvatar";
import { getInitials } from "@/shared/utils/helpers";

interface MessageAvatarProps {
  direction: "inbound" | "outbound";
  authorType: string;
  contactName: string;
  userImageUrl?: string;
  userName?: string;
  size?: number;
}

const MessageAvatar = ({
  direction,
  authorType,
  contactName,
  userImageUrl,
  userName,
  size = 32,
}: MessageAvatarProps) => {
  const isOutgoing = direction === "outbound";
  const isAI = authorType === "ai";

  if (isAI) {
    return <InitialAvatar isAI size={size} />;
  }

  if (isOutgoing) {
    if (userImageUrl) {
      return (
        <img
          src={userImageUrl}
          alt={userName || "You"}
          className="w-8 h-8 rounded-full object-cover shrink-0"
          width={size}
          height={size}
        />
      );
    }

    const initials = userName ? getInitials(userName) : "Y";
    return (
      <InitialAvatar
        initial={initials}
        size={size}
        bgColor="bg-slate-600"
        className="text-white font-bold text-xs"
      />
    );
  }

  const contactInitials = getInitials(contactName.trim() || "Guest");
  return (
    <InitialAvatar
      initial={contactInitials}
      size={size}
      bgColor="bg-slate-200"
      className="text-slate-900 font-bold text-xs"
    />
  );
};

export default MessageAvatar;
