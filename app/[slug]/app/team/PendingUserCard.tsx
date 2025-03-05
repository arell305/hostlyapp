import { ClerkPermissions, UserRole, roleMap } from "../../../../utils/enum";
import { PiTrashSimple } from "react-icons/pi";
import { Protect } from "@clerk/nextjs";

interface PendingUserCardProps {
  clerkInvitationId: string;
  email: string;
  role: UserRole;
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
          (isHostlyPage &&
            has({ permission: ClerkPermissions.MODERATES_APP })) ||
          has({ permission: ClerkPermissions.CREATE_EVENT })
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
