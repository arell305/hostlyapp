"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { formatRelativeTimestamp } from "@/shared/utils/luxon";
import StatusBadge from "./SmsStatusBadge";
import MessageAvatar from "./MessageAvatar";

interface SmsMessageProps {
  message: Doc<"smsMessages">;
  contactName: string;
  userImageUrl?: string;
  userName?: string;
}

const SmsMessage = ({
  message,
  contactName,
  userImageUrl,
  userName,
}: SmsMessageProps) => {
  const {
    direction,
    message: text,
    sentAt,
    updatedAt,
    status,
    authorType,
  } = message;

  const isOutgoing = direction === "outbound";
  const isMessageError = status === "failed";
  const time = formatRelativeTimestamp(sentAt ?? updatedAt);

  return (
    <div className="w-full my-3">
      <div
        className={`flex items-start gap-3 ${isOutgoing ? "flex-row-reverse" : ""}`}
      >
        <MessageAvatar
          direction={direction}
          authorType={authorType ?? "guest"}
          contactName={contactName}
          userImageUrl={userImageUrl}
          userName={userName}
          size={32}
        />

        <div className="flex-1 min-w-0">
          <div
            className={`
              max-w-[85%] break-words px-4 py-2.5 rounded-2xl text-sm
              ${
                isOutgoing
                  ? "bg-slate-700 text-white ml-auto rounded-tr-none"
                  : "bg-slate-100 text-slate-900 rounded-tl-none"
              }
            `}
          >
            {text}
          </div>

          <div
            className={`mt-1 text-xs text-slate-500 flex items-center gap-2 ${
              isOutgoing ? "justify-end" : ""
            }`}
          >
            <span>{time}</span>
            {isOutgoing && isMessageError && <StatusBadge status={status} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmsMessage;
