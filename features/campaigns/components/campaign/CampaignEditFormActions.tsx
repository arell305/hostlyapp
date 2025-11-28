"use client";

import { useUpdateCampaign } from "@/domain/campaigns";
import { useCampaignScope } from "@/shared/hooks/contexts";
import { useCampaignForm } from "@/shared/hooks/contexts/campaign/useCampaignForm";
import { CampaignPatch } from "@/shared/types/patch-types";
import FormActions from "@/shared/ui/buttonContainers/FormActions";
import ResponsiveConfirm from "@/shared/ui/responsive/ResponsiveConfirm";
import { hasFormValue } from "@/shared/utils/helpers";
import { useState } from "react";

const CampaignEditFormActions = () => {
  const [confirmCancel, setConfirmCancel] = useState<boolean>(false);
  const { setIsEditing, campaign } = useCampaignScope();
  const { updateCampaign, updateCampaignLoading, updateCampaignError } =
    useUpdateCampaign();
  const { formData, hasChanges, bodyError } = useCampaignForm();
  const { name, smsBody, scheduleTime } = formData;

  const isSent = campaign.status === "Sent";

  const handleSubmit = async () => {
    const updates: Partial<CampaignPatch> = {
      name: campaign.name,
    };

    if (!isSent) {
      updates.smsBody = campaign.smsBody;
      updates.scheduleTime = campaign.scheduleTime;
      updates.enableAiReplies = formData.enableAiReplies;
      updates.includeFaqInAiReplies = formData.includeFaqInAiReplies;
      updates.aiPrompt = formData.aiPrompt;
    }

    const success = await updateCampaign({
      campaignId: campaign._id,
      updates,
    });
    if (success.success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setConfirmCancel(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleConfirmCancel = () => {
    setConfirmCancel(false);
    setIsEditing(false);
  };

  const handleCloseConfirmCancel = () => {
    setConfirmCancel(false);
  };

  const isSubmitDisabled =
    !hasFormValue(name) ||
    !hasFormValue(smsBody) ||
    !hasFormValue(scheduleTime) ||
    !hasChanges ||
    bodyError !== null;

  const cancelText = hasChanges ? "Cancel" : "Close";

  return (
    <>
      <FormActions
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        isSubmitDisabled={isSubmitDisabled}
        isLoading={updateCampaignLoading}
        error={updateCampaignError}
        cancelText={cancelText}
        submitText="Save"
      />
      <ResponsiveConfirm
        isOpen={confirmCancel}
        title="Confirm Cancel"
        content="Are you sure you want to cancel? All data will be lost."
        confirmText="Yes, Cancel"
        cancelText="No, Continue"
        confirmVariant="destructive"
        error={null}
        isLoading={false}
        modalProps={{
          onClose: handleCloseConfirmCancel,
          onConfirm: handleConfirmCancel,
        }}
        drawerProps={{
          onSubmit: handleConfirmCancel,
          onOpenChange: setConfirmCancel,
        }}
      />
    </>
  );
};

export default CampaignEditFormActions;
