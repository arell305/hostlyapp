import { roleMap, UserRole } from "@/types/enums";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { useState } from "react";
import ResponsiveConfirm from "../../components/responsive/ResponsiveConfirm";
import CustomCard from "@/components/shared/cards/CustomCard";
import StaticField from "@/components/shared/fields/StaticField";
import ProfileHeader from "@/components/shared/headings/ProfileHeader";
import _ from "lodash";
import MemberTopBar from "./MemberTopBar";
import { useUserFromDb } from "@/hooks/queries/users/useUserFromDb";
import { Id } from "convex/_generated/dataModel";

interface UserIdContentProps {
  canEditUsers: boolean;
  handleBack: () => void;
  userId: Id<"users">;
}

const UserIdContent: React.FC<UserIdContentProps> = ({
  canEditUsers,
  handleBack,
  userId,
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const { updateUserById, error, isLoading, setError } = useUpdateUser();

  const { component, user } = useUserFromDb(userId);
  if (component) return component;

  const handleShowDeleteConfirmation = () => {
    setError(null);
    setShowDeleteConfirmation(true);
  };

  const handleCloseDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
    setError(null);
  };

  const handleDeleteUser = async () => {
    const success = await updateUserById(user._id, {
      isActive: false,
    });
    if (success) {
      handleCloseDeleteConfirmation();
    }
  };

  return (
    <section>
      <MemberTopBar
        userData={user}
        onBack={handleBack}
        handleShowDeleteConfirmation={handleShowDeleteConfirmation}
        canEditUsers={canEditUsers}
      />

      <CustomCard>
        <ProfileHeader imageUrl={user.imageUrl} name={user.name} />

        <StaticField className="border-t" label="Email" value={user.email} />
        <StaticField
          className="border-t"
          label="Role"
          value={roleMap[user.role as UserRole] ?? "Not Set"}
        />

        {user.role === UserRole.Promoter && (
          <StaticField label="Promo Code" value={user.promoCode ?? "Not Set"} />
        )}

        <ResponsiveConfirm
          isOpen={showDeleteConfirmation}
          title="Confirm User Deletion"
          confirmText="Delete User"
          cancelText="Cancel"
          content="Are you sure you want to delete this user? This action cannot be undone."
          confirmVariant="destructive"
          error={error}
          isLoading={isLoading}
          modalProps={{
            onClose: () => handleCloseDeleteConfirmation(),
            onConfirm: () => handleDeleteUser(),
          }}
          drawerProps={{
            onSubmit: handleDeleteUser,
            onOpenChange: () => handleCloseDeleteConfirmation(),
          }}
        />
      </CustomCard>
    </section>
  );
};

export default UserIdContent;
