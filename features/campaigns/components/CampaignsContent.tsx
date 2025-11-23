"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import CampaignCard from "./CampaignCard";
import { useContextOrganization } from "@/shared/hooks/contexts";
import CardContainer from "@/shared/ui/containers/CardContainer";
import { useUpdateCampaign } from "@/domain/campaigns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ResponsiveConfirm from "@/shared/ui/responsive/ResponsiveConfirm";

interface CampaignsContentProps {
  campaigns: Doc<"campaigns">[];
}
const CampaignsContent = ({ campaigns }: CampaignsContentProps) => {
  const { organization } = useContextOrganization();
  const router = useRouter();
  const [campaignToDelete, setCampaignToDelete] =
    useState<Id<"campaigns"> | null>(null);
  const { updateCampaign, updateCampaignLoading, updateCampaignError } =
    useUpdateCampaign();

  const handleEdit = (campaign: Doc<"campaigns">) => {
    router.push(`${baseHref}/${campaign.userId}/${campaign._id}?edit=true`, {
      scroll: false,
    });
  };
  const handleDelete = async (campaignId: Id<"campaigns">) => {
    setCampaignToDelete(campaignId);
  };

  const handleConfirmDelete = async () => {
    if (!campaignToDelete) {
      return;
    }
    const success = await updateCampaign({
      campaignId: campaignToDelete,
      updates: {
        isActive: false,
      },
    });
    if (success) {
      handleCloseDeleteConfirmModal();
    }
  };

  const handleCloseDeleteConfirmModal = () => {
    setCampaignToDelete(null);
  };

  const handleCancel = async (campaignId: Id<"campaigns">) => {
    await updateCampaign({
      campaignId,
      updates: {
        status: "Cancelled",
      },
    });
  };
  const handleReactivate = async (campaignId: Id<"campaigns">) => {
    await updateCampaign({
      campaignId,
      updates: {
        isActive: true,
      },
    });
  };
  const handleResume = async (campaignId: Id<"campaigns">) => {
    await updateCampaign({
      campaignId,
      updates: {
        status: "Scheduled",
      },
    });
  };

  const baseHref = `/${organization.slug}/app/campaigns/`;

  const showDeleteConfirm = campaignToDelete !== null;

  if (campaigns.length === 0) {
    return <p className="text-grayText">No campaigns found.</p>;
  }

  return (
    <CardContainer className="p-1">
      {campaigns.map((campaign) => {
        const href = `${baseHref}/${campaign.userId}/${campaign._id}`;
        return (
          <CampaignCard
            key={campaign._id}
            campaign={campaign}
            href={href}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCancel={handleCancel}
            onReactivate={handleReactivate}
            onResume={handleResume}
          />
        );
      })}
      <ResponsiveConfirm
        isOpen={showDeleteConfirm}
        title="Confirm Archive"
        content="Are you sure you want to archive this campaign?"
        confirmText="Yes, Archive"
        cancelText="No, Cancel"
        confirmVariant="destructive"
        error={updateCampaignError}
        isLoading={updateCampaignLoading}
        modalProps={{
          onClose: handleCloseDeleteConfirmModal,
          onConfirm: handleConfirmDelete,
        }}
        drawerProps={{
          onOpenChange: handleCloseDeleteConfirmModal,
          onSubmit: handleConfirmDelete,
        }}
      />
    </CardContainer>
  );
};

export default CampaignsContent;
