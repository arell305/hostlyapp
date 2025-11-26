"use client";

import PageContainer from "@/shared/ui/containers/PageContainer";
import SmsThreadNav from "./nav/SmsThreadNav";
import SmsThreadFooter from "./footer/SmsThreadFooter";
import SmsThreadMessages from "./messages/SmsThreadMessages";

const SmsThreadPageContent = () => {
  return (
    <PageContainer>
      <SmsThreadNav />
      <SmsThreadMessages />
      <SmsThreadFooter />
    </PageContainer>
  );
};

export default SmsThreadPageContent;
