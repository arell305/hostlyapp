"use client";

import { CampaignFormProvider } from "@/contexts/campain/CampaignFormProvider";
import CampaignIdPage from "./CampaignIdPage";

const CampaignIdProvider = () => {
  return (
    <CampaignFormProvider>
      <CampaignIdPage />
    </CampaignFormProvider>
  );
};

export default CampaignIdProvider;
