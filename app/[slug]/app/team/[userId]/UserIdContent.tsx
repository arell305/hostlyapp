import { UserWithPromoCode } from "@/types/types";
import { roleMap, UserRole } from "@/types/enums";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { useState } from "react";
import ResponsiveConfirm from "../../components/responsive/ResponsiveConfirm";
import CustomCard from "@/components/shared/cards/CustomCard";
import StaticField from "@/components/shared/fields/StaticField";
import ProfileHeader from "@/components/shared/headings/ProfileHeader";
import _ from "lodash";
import MemberTopBar from "./MemberTopBar";

interface UserIdContentProps {
  userData: UserWithPromoCode;
  canEditUsers: boolean;
  handleBack: () => void;
}

const UserIdContent: React.FC<UserIdContentProps> = ({
  userData,
  canEditUsers,
  handleBack,
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const { updateUserById, error, isLoading, setError } = useUpdateUser();

  const handleShowDeleteConfirmation = () => {
    setError(null);
    setShowDeleteConfirmation(true);
  };

  const handleCloseDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
    setError(null);
  };

  const handleDeleteUser = async () => {
    const success = await updateUserById(userData._id, {
      isActive: false,
    });
    if (success) {
      handleCloseDeleteConfirmation();
    }
  };

  return (
    <section>
      <MemberTopBar
        userData={userData}
        onBack={handleBack}
        handleShowDeleteConfirmation={handleShowDeleteConfirmation}
        canEditUsers={canEditUsers}
      />

      <CustomCard>
        <ProfileHeader imageUrl={userData.imageUrl} name={userData.name} />

        <StaticField
          className="border-t"
          label="Email"
          value={userData.email}
        />
        <StaticField
          className="border-t"
          label="Role"
          value={roleMap[userData.role as UserRole] ?? "Not Set"}
        />

        {userData.role === UserRole.Promoter && (
          <StaticField
            label="Promo Code"
            value={userData.promoCode ?? "Not Set"}
          />
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
