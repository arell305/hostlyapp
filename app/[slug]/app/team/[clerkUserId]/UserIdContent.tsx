import { Button } from "@/components/ui/button";
import Image from "next/image";
import { UserWithPromoCode } from "@/types/types";
import { UserRole, roleMap } from "@/types/enums";
import InfoRow from "../../components/UserInfoRow";

interface UserIdContentProps {
  userData: UserWithPromoCode;
  onBack: () => void;
  onDelete: () => void;
  onEdit: () => void;
  has: any;
  isCurrentUser: boolean;
  onReactivateUser: () => void;
  errorResumeUser: string | null;
  loadingReactivate: boolean;
  errorDeleteUser: string | null;
  loadingDeleteUser: boolean;
}

const UserIdContent: React.FC<UserIdContentProps> = ({
  userData,
  onBack,
  onDelete,
  onEdit,
  has,
  isCurrentUser,
  onReactivateUser,
  errorResumeUser,
  loadingReactivate,
  errorDeleteUser,
  loadingDeleteUser,
}) => {
  const isHostlyPage = userData.role === UserRole.Hostly_Moderator;
  const isAdmin = has({ role: UserRole.Admin });
  const isHostlyAdmin =
    has({ role: UserRole.Hostly_Admin }) ||
    has({ role: UserRole.Hostly_Moderator });
  const canEditUsers =
    has({ role: UserRole.Admin }) ||
    has({ role: UserRole.Manager }) ||
    (isAdmin && !isCurrentUser);
  const canDeleteAdminMods = isHostlyPage && isHostlyAdmin;
  return (
    <section className="container mx-auto  max-w-3xl ">
      <div className="">
        <Button variant="navGhost" size="nav" className="pl-4" onClick={onBack}>
          Back
        </Button>
      </div>
      <div className="flex items-center flex-col mb-4">
        {userData.imageUrl && (
          <Image
            src={userData.imageUrl}
            alt="Profile Image"
            width={100}
            height={100}
            className="rounded-full object-cover aspect-square w-[100px] h-[100px]"
          />
        )}

        <h2 className="mt-2 text-2xl font-semibold font-playfair">
          {userData.name}
        </h2>
      </div>
      <InfoRow label="Email" value={userData.email} />
      <InfoRow
        label="Role"
        value={userData.role ? roleMap[userData.role] : "Not Set"}
        canEdit={canEditUsers}
        onEdit={onEdit}
        isClickable={canEditUsers}
      />
      {userData.role === UserRole.Promoter && (
        <InfoRow label="Promo Code" value={userData.promoCode ?? "Not Set"} />
      )}
      {canEditUsers &&
        (userData.isActive ? (
          <div className="my-6 pl-4">
            <Button variant="navDestructive" size="nav" onClick={onDelete}>
              {loadingDeleteUser ? "Deleteing..." : "Delete User"}
            </Button>
            <p
              className={`pl-4 text-sm mt-1 ${errorDeleteUser ? "text-red-500" : "text-transparent"}`}
            >
              {errorDeleteUser || "Placeholder to maintain height"}
            </p>
          </div>
        ) : (
          <div>
            <Button
              disabled={loadingReactivate}
              variant="navGhost"
              size="nav"
              onClick={onReactivateUser}
            >
              {loadingReactivate ? "Reactivating..." : "Reactivate"}
            </Button>
            <p
              className={`pl-4 text-sm mt-1 ${errorResumeUser ? "text-red-500" : "text-transparent"}`}
            >
              {errorResumeUser || "Placeholder to maintain height"}
            </p>
          </div>
        ))}
    </section>
  );
};

export default UserIdContent;
