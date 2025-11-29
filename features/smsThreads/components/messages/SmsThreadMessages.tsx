"use client";
import { useSmsThreadData } from "../../provider/SmsThreadDataProvider";
import SmsMessage from "./SmsMessage";

const SmsThreadMessages = () => {
  const { smsMessages, contact, user } = useSmsThreadData();

  if (!smsMessages) {
    return <div>No messages found</div>;
  }

  return (
    <div className="h-[60vh] overflow-y-auto">
      {smsMessages.map((message) => (
        <SmsMessage
          key={message._id}
          message={message}
          contactName={contact.name}
          userImageUrl={user.imageUrl}
          userName={user.name}
        />
      ))}
    </div>
  );
};

export default SmsThreadMessages;
