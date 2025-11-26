"use client";

import Link from "next/link";
import { SmsThreadWithContactAndLastMessage } from "@/shared/types/convex-types";
import { Badge } from "@/shared/ui/primitive/badge";
import { getInitials } from "@/shared/utils/helpers";
import InitialAvatar from "@/shared/ui/avatars/InitialAvatar";
import { formatRelativeTimestamp } from "@/shared/utils/luxon";
import { getSenderPrefix } from "../../utils/helpers";

interface MessagePreviewProps {
  threadWithContact: SmsThreadWithContactAndLastMessage;
  href: string;
}

const MessagePreview = ({ threadWithContact, href }: MessagePreviewProps) => {
  const { thread, contact, lastMessage } = threadWithContact;

  const displayName = contact.name.trim() || contact.phoneNumber;
  const initials = getInitials(displayName);

  const timeAgo = formatRelativeTimestamp(
    lastMessage.sentAt ?? lastMessage.updatedAt
  );

  const senderPrefix = getSenderPrefix(lastMessage, initials);
  const previewText = lastMessage.message || "No message";

  return (
    <Link
      href={href}
      className="block p-4 rounded-lg hover:bg-cardBackgroundHover transition-colors group -mx-2"
    >
      <div className="flex gap-3">
        <InitialAvatar textSize="text-base" initial={initials} size={45} />

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-medium truncate pr-2">{displayName}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
              <span>{timeAgo}</span>
              {thread.needsHumanReview && (
                <Badge
                  variant="destructive"
                  className="h-5 px-1.5 text-[10px] font-medium"
                >
                  Review
                </Badge>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground truncate">
            <span
              className={
                lastMessage.direction === "outbound" ? "font-medium" : ""
              }
            >
              {senderPrefix}
            </span>
            {previewText}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default MessagePreview;
