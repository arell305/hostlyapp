"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import CampaignCard from "./CampaignCard";
import { useContextOrganization } from "@/shared/hooks/contexts";
import CardContainer from "@/shared/ui/containers/CardContainer";
import { useUpdateCampaign } from "@/domain/campaigns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ResponsiveConfirm from "@/shared/ui/responsive/ResponsiveConfirm";
import { CampaignWithEvent } from "@/shared/types/types";

interface CampaignsContentProps {
  campaigns: CampaignWithEvent[] | Doc<"campaigns">[];
}
const CampaignsContent = ({ campaigns }: CampaignsContentProps) => {
  const { organization } = useContextOrganization();
  const router = useRouter();
  const [campaignToDelete, setCampaignToDelete] =
    useState<Id<"campaigns"> | null>(null);
  const [loadingCampaignId, setLoadingCampaignId] =
    useState<Id<"campaigns"> | null>(null);
  const [campaignErrors, setCampaignErrors] = useState<
    Record<Id<"campaigns">, string | null>
  >({});
  const [campaignToStopReplies, setCampaignToStopReplies] =
    useState<Id<"campaigns"> | null>(null);
  const [showStopRepliesConfirm, setShowStopRepliesConfirm] =
    useState<boolean>(false);

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
    setLoadingCampaignId(campaignId);
    setCampaignErrors((prev) => ({ ...prev, [campaignId]: null }));
    try {
      await updateCampaign({
        campaignId,
        updates: {
          status: "Cancelled",
        },
      });
    } catch (error) {
      setCampaignErrors((prev) => ({
        ...prev,
        [campaignId]: (error as Error).message || "Unknown error",
      }));
    } finally {
      setLoadingCampaignId(null);
    }
  };
  const handleReactivate = async (campaignId: Id<"campaigns">) => {
    setLoadingCampaignId(campaignId);
    setCampaignErrors((prev) => ({ ...prev, [campaignId]: null }));
    try {
      await updateCampaign({
        campaignId,
        updates: {
          isActive: true,
        },
      });
    } catch (error) {
      setCampaignErrors((prev) => ({
        ...prev,
        [campaignId]: (error as Error).message || "Unknown error",
      }));
    } finally {
      setLoadingCampaignId(null);
    }
  };
  const handleResume = async (campaignId: Id<"campaigns">) => {
    setLoadingCampaignId(campaignId);
    setCampaignErrors((prev) => ({ ...prev, [campaignId]: null }));
    try {
      await updateCampaign({
        campaignId,
        updates: {
          status: "Scheduled",
        },
      });
    } catch (error) {
      setCampaignErrors((prev) => ({
        ...prev,
        [campaignId]: (error as Error).message || "Unknown error",
      }));
    } finally {
      setLoadingCampaignId(null);
    }
  };

  const handleStop = async (campaignId: Id<"campaigns">) => {
    setCampaignToStopReplies(campaignId);
    setShowStopRepliesConfirm(true);
  };

  const handleCloseStopRepliesConfirmModal = () => {
    setCampaignToStopReplies(null);
    setShowStopRepliesConfirm(false);
  };

  const handleConfirmStopReplies = async () => {
    if (!campaignToStopReplies) {
      return;
    }
    const success = await updateCampaign({
      campaignId: campaignToStopReplies,
      updates: {
        stopRepliesAt: Date.now(),
      },
    });
    if (success) {
      handleCloseStopRepliesConfirmModal();
    }
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
        const isLoading = loadingCampaignId === campaign._id;
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
            isLoading={isLoading}
            error={campaignErrors[campaign._id]}
            onStop={handleStop}
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
      <ResponsiveConfirm
        isOpen={showDeleteConfirm}
        title="Confirm Stop AI Replies"
        content="Are you sure you want to stop AI replies for this campaign? You can not resume AI replies later."
        confirmText="Yes, Stop AI Replies"
        cancelText="No, Cancel"
        confirmVariant="destructive"
        error={updateCampaignError}
        isLoading={updateCampaignLoading}
        modalProps={{
          onClose: handleCloseStopRepliesConfirmModal,
          onConfirm: handleConfirmStopReplies,
        }}
        drawerProps={{
          onOpenChange: handleCloseStopRepliesConfirmModal,
          onSubmit: handleConfirmStopReplies,
        }}
      />
    </CardContainer>
  );
};

export default CampaignsContent;
