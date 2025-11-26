"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { hasFormValue } from "@/shared/utils/helpers";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import { useCreateSmsMessage } from "@/domain/smsMessages";
import FieldErrorMessage from "@/shared/ui/error/FieldErrorMessage";
import { useSmsThreadId } from "@/shared/hooks/contexts/smsThread/useSmsThreadId";

const SmsThreadFooter = () => {
  const [messageText, setMessageText] = useState<string>("");
  const { smsThreadId } = useSmsThreadId();
  const { createSmsMessage, loading, error } = useCreateSmsMessage();

  const handleSend = async () => {
    const success = await createSmsMessage({
      message: messageText,
      threadId: smsThreadId,
      direction: "outbound",
    });
    if (success) {
      setMessageText("");
    }
  };

  const isDisabled = !hasFormValue(messageText) || loading;

  return (
    <div className="p-2 items-end gap-2 w-full">
      {error && <FieldErrorMessage error={error} />}
      <div className="w-full flex justify-between gap-2">
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message"
          rows={1}
          className="bg-transparent w-full resize-none overflow-hidden rounded-xl border px-3 py-2 text-sm outline-none focus:ring-1 focus:primaryBlue max-h-32"
        />
        <IconButton
          icon={<Send />}
          onClick={handleSend}
          disabled={isDisabled}
          className="
   
        "
        />
      </div>
    </div>
  );
};

export default SmsThreadFooter;
