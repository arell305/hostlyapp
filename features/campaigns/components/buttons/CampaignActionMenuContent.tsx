"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import MenuContainer from "@/shared/ui/buttonContainers/menu/MenuContainer";
import MenuDelete from "@/shared/ui/buttonContainers/menu/MenuDelete";
import MenuCancel from "@/shared/ui/buttonContainers/menu/MenuCancel";
import MenuReactivate from "@/shared/ui/buttonContainers/menu/MenuReactivate";
import MenuResume from "@/shared/ui/buttonContainers/menu/MenuResume";
import MenuEvent from "@/shared/ui/buttonContainers/menu/MenuEvent";
import MenuEdit from "@/shared/ui/buttonContainers/menu/MenuEdit";
import MenuStop from "@/shared/ui/buttonContainers/menu/MenuStop";

type Props = {
  campaign: Doc<"campaigns">;
  onDelete: (id: Id<"campaigns">) => void;
  onCancel: (id: Id<"campaigns">) => void;
  onReactivate: (id: Id<"campaigns">) => void;
  onResume: (id: Id<"campaigns">) => void;
  onOpenEvent?: (campaign: Doc<"campaigns">) => void;
  onClose: () => void;
  onEdit?: (campaign: Doc<"campaigns">) => void;
  onStop: (id: Id<"campaigns">) => void;
};

export default function CampaignActionMenuContent({
  campaign,
  onDelete,
  onCancel,
  onReactivate,
  onResume,
  onOpenEvent,
  onClose,
  onEdit,
  onStop,
}: Props) {
  const hasEvent = campaign.eventId !== null && campaign.eventId !== undefined;

  if (!campaign.isActive) {
    return (
      <MenuContainer>
        <MenuReactivate
          doc={campaign}
          onReactivate={() => onReactivate(campaign._id)}
          onClose={onClose}
        />
      </MenuContainer>
    );
  }

  return (
    <MenuContainer>
      {onEdit && <MenuEdit doc={campaign} onEdit={onEdit} onClose={onClose} />}
      {hasEvent && onOpenEvent && (
        <MenuEvent doc={campaign} onOpenEvent={onOpenEvent} onClose={onClose} />
      )}

      {campaign.status === "Scheduled" && (
        <MenuCancel
          doc={campaign}
          onCancel={() => onCancel(campaign._id)}
          onClose={onClose}
        />
      )}

      {campaign.status === "Cancelled" && (
        <MenuResume doc={campaign} onResume={onResume} onClose={onClose} />
      )}
      {campaign.enableAiReplies &&
        campaign.stopRepliesAt === undefined &&
        campaign.status !== "Scheduled" && (
          <MenuStop
            doc={campaign}
            onStop={() => onStop(campaign._id)}
            onClose={onClose}
          />
        )}

      <MenuDelete
        isArchived
        doc={campaign}
        onDelete={() => onDelete(campaign._id)}
        onClose={onClose}
      />
    </MenuContainer>
  );
}
