"use client";

import { Doc } from "@/convex/_generated/dataModel";
import CustomCard from "@/shared/ui/cards/CustomCard";
import MessagePreview from "./MessagePreview";
import { usePathname } from "next/navigation";
import { SmsThreadWithContactAndLastMessage } from "@/shared/types/convex-types";

interface MessagingContainerProps {
  smsThreads: SmsThreadWithContactAndLastMessage[];
  searchTerm: string;
}

const MessagingContainer = ({
  smsThreads,
  searchTerm,
}: MessagingContainerProps) => {
  const filteredThreads = smsThreads.filter(
    (thread) =>
      thread.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.contact.phoneNumber.includes(searchTerm) ||
      thread.lastMessage.message
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const pathname = usePathname();

  if (filteredThreads.length === 0 && searchTerm.trim() === "") {
    return <p className="text-grayText">Message sent. No replies yet.</p>;
  }

  if (filteredThreads.length === 0) {
    return <p className="text-grayText">No messages found.</p>;
  }

  return (
    <CustomCard>
      {filteredThreads.map((threadWithContact) => {
        const href = `${pathname}/threads/${threadWithContact.thread._id}`;
        return (
          <MessagePreview
            threadWithContact={threadWithContact}
            key={threadWithContact.thread._id}
            href={href}
          />
        );
      })}
    </CustomCard>
  );
};

export default MessagingContainer;
