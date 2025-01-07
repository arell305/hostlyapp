import { useAction } from "convex/react";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { api } from "../../../../convex/_generated/api";
import { FaEllipsisV } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { ResponseStatus, roleMap } from "../../../../utils/enum";
import ConfirmModal from "../components/ConfirmModal";
import useMediaQuery from "@/hooks/useMediaQuery";
import BaseDrawer from "@/[companyName]/app/components/drawer/BaseDrawer";
import ResponsiveConfirm from "@/[companyName]/app/components/responsive/ResponsiveConfirm";
import { PiTrashSimple } from "react-icons/pi";
import { Protect } from "@clerk/nextjs";

interface PendingUserCardProps {
  clerkInvitationId: string;
  email: string;
  role: string;
  onRevoke: (clerkInvitationId: string) => void;
  isHostlyPage: boolean;
}

const PendingUserCard: React.FC<PendingUserCardProps> = ({
  clerkInvitationId,
  email,
  role,
  onRevoke,
  isHostlyPage,
}) => {
  const handleClick = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
    event.preventDefault();
    onRevoke(clerkInvitationId);
  };

  return (
    <div className="h-[95px] border-b border-gray-300 p-4 w-full flex items-center justify-between">
      <div>
        <h3 className="font-bold">{email}</h3>
        <p>{roleMap[role]}</p>
      </div>
      <Protect
        condition={(has) =>
          (isHostlyPage && has({ permission: "org:app:moderate" })) ||
          has({ permission: "org:events:create" })
        }
      >
        <PiTrashSimple
          onClick={handleClick}
          className="cursor-pointer text-2xl text-gray-800 hover:text-gray-500"
        />
      </Protect>
    </div>
  );
};

export default PendingUserCard;
