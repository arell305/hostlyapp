import { useAction } from "convex/react";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { api } from "../../../convex/_generated/api";
import { FaEllipsisV } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { ResponseStatus, roleMap } from "../../../utils/enum";
import ConfirmModal from "../components/ConfirmModal";
import useMediaQuery from "@/hooks/useMediaQuery";
import BaseDrawer from "@/dashboard/components/drawer/BaseDrawer";
import ResponsiveConfirm from "@/dashboard/components/responsive/ResponsiveConfirm";
import { PiTrashSimple } from "react-icons/pi";

interface PendingUserCardProps {
  clerkInvitationId: string;
  email: string;
  role: string;
  clerkOrgId: string;
  clerkUserId: string;
  onRevoke: (clerkInvitationId: string) => void;
}

const PendingUserCard: React.FC<PendingUserCardProps> = ({
  clerkInvitationId,
  email,
  role,
  clerkOrgId,
  clerkUserId,
  onRevoke,
}) => {
  const handleClick = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
    event.preventDefault();
    onRevoke(clerkInvitationId);
  };

  return (
    <div className="border-b border-gray-300 p-4 w-full flex items-center justify-between">
      <div>
        <h3 className="font-bold">{email}</h3>
        <p>{roleMap[role]}</p>
      </div>
      <PiTrashSimple
        onClick={handleClick}
        className="cursor-pointer text-2xl  text-gray-800 hover:text-gray-500"
      />

      {/* <ResponsiveConfirm
        isOpen={showResponsiveConfirm}
        title="Confirm User Revocation"
        confirmText="Revoke User"
        cancelText="Cancel"
        content="Are you sure you want to revoke this invitation? This action cannot be undone."
        confirmVariant="destructive"
        modalProps={{
          onClose: () => setShowResponsiveConfirm(false),
          onConfirm: handleRevokeConfirmation,
        }}
        drawerProps={{
          onOpenChange: (open: boolean) => setShowResponsiveConfirm(open),
          onSubmit: handleRevokeConfirmation,
        }}
      /> */}
    </div>
  );
};

export default PendingUserCard;
