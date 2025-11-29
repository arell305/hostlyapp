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
  campaigns: (CampaignWithEvent | Doc<"campaigns">)[];
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
  const [showStopRepliesConfirm, setShowStopRepliesConfirm] = useState(false);

  const { updateCampaign, updateCampaignLoading, updateCampaignError } =
    useUpdateCampaign();
  const baseHref = `/${organization.slug}/app/campaigns/`;

  // Calculate total replies needed
  const totalRepliesNeeded = campaigns.reduce((sum, c) => {
    const withReplies = c as CampaignWithEvent;
    return sum + (withReplies.awaitingReplies ?? 0);
  }, 0);

  // Split and sort: campaigns with replies first
  const campaignsWithReplies = campaigns
    .filter(
      (c): c is CampaignWithEvent =>
        "awaitingReplies" in c && c.awaitingReplies > 0
    )
    .sort((a, b) => b.awaitingReplies - a.awaitingReplies);

  const campaignsWithoutReplies = campaigns.filter(
    (c): c is CampaignWithEvent | Doc<"campaigns"> =>
      !("awaitingReplies" in c) || c.awaitingReplies === 0
  );

  const handleEdit = (campaign: Doc<"campaigns">) => {
    router.push(`${baseHref}/${campaign.userId}/${campaign._id}?edit=true`, {
      scroll: false,
    });
  };

  const handleDelete = (campaignId: Id<"campaigns">) =>
    setCampaignToDelete(campaignId);
  const handleConfirmDelete = async () => {
    if (!campaignToDelete) return;
    const success = await updateCampaign({
      campaignId: campaignToDelete,
      updates: { isActive: false },
    });
    if (success) setCampaignToDelete(null);
  };

  const handleCancel = async (campaignId: Id<"campaigns">) => {
    setLoadingCampaignId(campaignId);
    try {
      await updateCampaign({ campaignId, updates: { status: "Cancelled" } });
    } catch (error) {
      setCampaignErrors((prev) => ({
        ...prev,
        [campaignId]: (error as Error).message,
      }));
    } finally {
      setLoadingCampaignId(null);
    }
  };

  const handleReactivate = async (campaignId: Id<"campaigns">) => {
    setLoadingCampaignId(campaignId);
    try {
      await updateCampaign({ campaignId, updates: { isActive: true } });
    } catch (error) {
      setCampaignErrors((prev) => ({
        ...prev,
        [campaignId]: (error as Error).message,
      }));
    } finally {
      setLoadingCampaignId(null);
    }
  };

  const handleResume = async (campaignId: Id<"campaigns">) => {
    setLoadingCampaignId(campaignId);
    try {
      await updateCampaign({ campaignId, updates: { status: "Scheduled" } });
    } catch (error) {
      setCampaignErrors((prev) => ({
        ...prev,
        [campaignId]: (error as Error).message,
      }));
    } finally {
      setLoadingCampaignId(null);
    }
  };

  const handleStop = (campaignId: Id<"campaigns">) => {
    setCampaignToStopReplies(campaignId);
    setShowStopRepliesConfirm(true);
  };

  const handleConfirmStopReplies = async () => {
    if (!campaignToStopReplies) return;
    const success = await updateCampaign({
      campaignId: campaignToStopReplies,
      updates: { stopRepliesAt: Date.now() },
    });
    if (success) {
      setCampaignToStopReplies(null);
      setShowStopRepliesConfirm(false);
    }
  };

  const renderCampaignCard = (
    campaign: CampaignWithEvent | Doc<"campaigns">
  ) => {
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
        onStop={handleStop}
        isLoading={isLoading}
        error={campaignErrors[campaign._id]}
      />
    );
  };

  if (campaigns.length === 0) {
    return (
      <p className="text-gray-500 text-center py-12">No campaigns found.</p>
    );
  }

  return (
    <CardContainer className="p-1 space-y-2">
      {/* Replies Needed Section */}
      {totalRepliesNeeded > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white ">
            Replies Needed ({totalRepliesNeeded})
          </h2>
          <div className="space-y-3">
            {campaignsWithReplies.map(renderCampaignCard)}
          </div>
        </div>
      )}

      {/* Other Campaigns */}
      {(totalRepliesNeeded === 0 || campaignsWithoutReplies.length > 0) && (
        <div>
          {totalRepliesNeeded > 0 && (
            <h2 className="text-lg font-medium text-gray-400 ">
              Other Campaigns
            </h2>
          )}
          <div className="space-y-3">
            {campaignsWithoutReplies.map(renderCampaignCard)}
          </div>
        </div>
      )}

      {/* Modals */}
      <ResponsiveConfirm
        isOpen={campaignToDelete !== null}
        title="Archive Campaign"
        content="This campaign will be archived and hidden."
        confirmText="Archive"
        cancelText="Cancel"
        confirmVariant="destructive"
        error={updateCampaignError}
        isLoading={updateCampaignLoading}
        modalProps={{
          onClose: () => setCampaignToDelete(null),
          onConfirm: handleConfirmDelete,
        }}
        drawerProps={{
          onOpenChange: () => setCampaignToDelete(null),
          onSubmit: handleConfirmDelete,
        }}
      />

      <ResponsiveConfirm
        isOpen={showStopRepliesConfirm}
        title="Stop AI Replies"
        content="AI will stop replying to new messages in this campaign."
        confirmText="Stop AI Replies"
        cancelText="Cancel"
        confirmVariant="destructive"
        error={updateCampaignError}
        isLoading={updateCampaignLoading}
        modalProps={{
          onClose: () => setShowStopRepliesConfirm(false),
          onConfirm: handleConfirmStopReplies,
        }}
        drawerProps={{
          onOpenChange: () => setShowStopRepliesConfirm(false),
          onSubmit: handleConfirmStopReplies,
        }}
      />
    </CardContainer>
  );
};

export default CampaignsContent;
