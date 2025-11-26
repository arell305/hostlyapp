"use client";

import SubPageContainer from "@/shared/ui/containers/SubPageContainer";
import MessagingLoader from "./MessageingLoader";
import { useCampaignScope } from "@/shared/hooks/contexts";
import SearchInput from "@/features/events/components/SearchInput";
import { useRef, useState } from "react";

const MessagingTab = () => {
  const { campaign } = useCampaignScope();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const messageNotSent = campaign.status === "Scheduled";
  const messageCancelled = campaign.status === "Cancelled";

  if (messageCancelled) {
    return (
      <p className="text-grayText">
        Message cancelled. No replies will appear here.
      </p>
    );
  }

  if (messageNotSent) {
    return (
      <p className="text-grayText">
        Message scheduled. Replies will appear here once it's sent.
      </p>
    );
  }

  return (
    <SubPageContainer className="flex flex-col gap-4">
      <SearchInput
        placeholder="Search messages"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchInputRef={searchInputRef}
      />
      <MessagingLoader searchTerm={searchTerm} />
    </SubPageContainer>
  );
};

export default MessagingTab;
