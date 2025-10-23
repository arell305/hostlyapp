"use client";

import { PiTrashSimple } from "react-icons/pi";
import { UserRole, roleMap } from "@/shared/types/enums";
import { PendingInvitationUser } from "@/shared/types/types";
interface PendingUserCardProps {
  user: PendingInvitationUser;
  onRevoke: (clerkInvitationId: string) => void;
  isHostlyPage?: boolean;
  canManageTeam: boolean;
}

const PendingUserCard: React.FC<PendingUserCardProps> = ({
  user,
  onRevoke,
  canManageTeam,
}) => {
  const handleClick = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
    event.preventDefault();
    onRevoke(user.clerkInvitationId);
  };

  return (
    <div className="h-[95px]  p-4 w-full flex items-center justify-between">
      <div>
        <h3 className="font-bold">{user.email}</h3>
        <p>{roleMap[user.role as UserRole]}</p>
      </div>
      {canManageTeam && (
        <PiTrashSimple
          onClick={handleClick}
          className="cursor-pointer text-2xl text-red-500 hover:text-gray-500"
        />
      )}
    </div>
  );
};

export default PendingUserCard;
