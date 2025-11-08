"use client";

import { Badge } from "@/shared/ui/primitive/badge";
import { Doc, Id } from "convex/_generated/dataModel";
import { formatPhoneNumber } from "@/shared/utils/format";
import {
  CONSENT_STATUS_LABEL,
  consentBadgeClass,
} from "@/shared/lib/frontendHelper";
import ResponsiveContactActions from "./ResponsiveContactActions";

type ContactCardProps = {
  contact: Doc<"contacts">;
  onEdit: (contact: Doc<"contacts">) => void;
  onDelete: (id: Id<"contacts">) => void;
};

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onEdit,
  onDelete,
}) => {
  const status = contact.consentStatus;
  const badgeClass = consentBadgeClass(status);
  const statusLabel = CONSENT_STATUS_LABEL[status];

  return (
    <div className="border-b py-4 px-3 w-full flex justify-between items-center">
      <div>
        <div className="flex items-center">
          <p className="font-semibold">{contact.name}</p>
          <p className="text-whiteText/70 font-normal pt-[2px] ml-2">
            {formatPhoneNumber(contact.phoneNumber || "")}
          </p>
        </div>
        <div className="flex items-center gap-2 pt-[2px]">
          <Badge className={badgeClass}>{statusLabel}</Badge>
        </div>
      </div>

      <ResponsiveContactActions
        contact={contact}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default ContactCard;
