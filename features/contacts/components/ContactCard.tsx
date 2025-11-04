"use client";

import { Badge } from "@/shared/ui/primitive/badge";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import { Pencil, Trash } from "lucide-react";
import { Doc, Id } from "convex/_generated/dataModel";
import { formatPhoneNumber } from "@/shared/utils/format";
import {
  CONSENT_STATUS_LABEL,
  consentBadgeClass,
} from "@/shared/lib/frontendHelper";

type ContactCardProps = {
  contact: Doc<"contacts">;
  onEdit: (contact: Doc<"contacts">) => void;
  onShowDelete: (id: Id<"contacts">) => void;
};

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onEdit,
  onShowDelete,
}) => {
  const status = contact.consentStatus;
  const badgeClass = consentBadgeClass(status);
  const statusLabel = CONSENT_STATUS_LABEL[status];

  return (
    <div className="border-b p-4 w-full flex justify-between items-center">
      <div className="flex justify-center items-center">
        <div>
          <div className="flex items-center">
            <p className="text-xl font-semibold">{contact.name}</p>
            <p className="text-lg text-whiteText/70 font-normal pt-[2px] ml-2">
              {formatPhoneNumber(contact.phoneNumber || "")}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-[2px]">
            <Badge className={badgeClass}>{statusLabel}</Badge>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <IconButton
          icon={<Pencil size={20} />}
          title="Edit"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(contact);
          }}
        />
        <IconButton
          icon={<Trash size={20} />}
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onShowDelete(contact._id);
          }}
        />
      </div>
    </div>
  );
};

export default ContactCard;
