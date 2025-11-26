"use client";

import SmsThreadPageContent from "./components/SmsThreadPageContent";
import { SmsThreadDataProvider } from "./provider/SmsThreadDataProvider";

const SmsThreadPage = () => {
  return (
    <SmsThreadDataProvider>
      <SmsThreadPageContent />
    </SmsThreadDataProvider>
  );
};

export default SmsThreadPage;
