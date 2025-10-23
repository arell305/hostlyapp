"use client";

import ResponsiveConfirm from "@shared/ui/responsive/ResponsiveConfirm";
import { useUpdateCampaign } from "@/domain/campaigns";
import { CampaignValues } from "@shared/types/types";
import { Doc } from "convex/_generated/dataModel";
import { useState } from "react";

interface CampaignIdContentProps {
  campaign: Doc<"campaigns">;
}
const CampaignIdContent = ({ campaign }: CampaignIdContentProps) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const {
    updateCampaign,
    updateCampaignLoading,
    updateCampaignError,
    setUpdateCampaignError,
  } = useUpdateCampaign();

  const handleSave = async (update: CampaignValues): Promise<boolean> => {
    const result = await updateCampaign({
      campaignId: campaign._id,
      updates: { ...update },
    });
    return result.success;
  };

  const showConfirmDeleteModal = (campaignId: Doc<"campaigns">["_id"]) => {
    setShowConfirmDelete(true);
    setUpdateCampaignError(null);
  };

  const handleDelete = async (): Promise<void> => {
    const result = await updateCampaign({
      campaignId: campaign._id,
      updates: { isActive: false },
    });
    if (result.success) {
      handleCloseConfirmDeleteModal();
      setShowConfirmDelete(false);
    }
  };

  const handleCloseConfirmDeleteModal = () => {
    setShowConfirmDelete(false);
    setUpdateCampaignError(null);
  };

  return (
    <div>
      CampaignIdContent
      <ResponsiveConfirm
        isOpen={showConfirmDelete}
        title="Confirm Deletion"
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
        confirmVariant="destructive"
        content={
          "Are you sure you want to delete this FAQ? This action cannot be undone."
        }
        error={updateCampaignError}
        isLoading={updateCampaignLoading}
        modalProps={{
          onClose: handleCloseConfirmDeleteModal,
          onConfirm: handleDelete,
        }}
      />
    </div>
  );
};

export default CampaignIdContent;
