"use client";

import SubPageContainer from "@/shared/ui/containers/SubPageContainer";
import MessagingHeader from "./MessagingHeader";
import MessagingLoader from "./MessageingContainer";

const MessagingTab = () => {
  return (
    <SubPageContainer className="flex flex-col gap-8">
      <MessagingHeader />
      <MessagingLoader />
    </SubPageContainer>
  );
};

export default MessagingTab;
