"use client";

import { useEffect } from "react";
import { useEventContext } from "@/shared/hooks/contexts";
import CampaignEventDetails from "./CampaignEventDetails";
import { useCreateCampaignForm } from "../../contexts/CampaignFormContext";

const CampaignEventUpdateGuestState = () => {
  const { setHasGuestList, updateFormData } = useCreateCampaignForm();
  const { guestListInfo } = useEventContext();

  useEffect(() => {
    const hasGuestList = guestListInfo !== null;
    updateFormData({
      audienceType: hasGuestList ? "All Guest List Guests" : "All Contacts",
    });
    setHasGuestList(hasGuestList);
  }, [guestListInfo, setHasGuestList]);

  return <CampaignEventDetails />;
};

export default CampaignEventUpdateGuestState;
