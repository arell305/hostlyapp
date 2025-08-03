import { UserWithPromoCode } from "@/types/types";
import { UserRole } from "@/types/enums";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { useState } from "react";
import ResponsiveConfirm from "../../components/responsive/ResponsiveConfirm";
import CustomCard from "@/components/shared/cards/CustomCard";
import StaticField from "@/components/shared/fields/StaticField";
import EditableSelectField from "@/components/shared/editable/EditableSelectField";
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
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>(userData.role ?? "");
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

  const handleReactivateUser = async () => {
    await updateUserById(userData._id, {
      isActive: true,
    });
  };

  const handleSaveRole = async () => {
    const success = await updateUserById(userData._id, {
      role: selectedRole as UserRole,
    });
    if (success) {
      handleCancelEditing();
    }
  };

  const handleToggleEditing = () => {
    setIsEditing((prev) => !prev);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
  };

  return (
    <section>
      <MemberTopBar
        userData={userData}
        onBack={handleBack}
        isEditing={isEditing}
        handleToggleEditing={handleToggleEditing}
        handleCancelEditing={handleCancelEditing}
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
        <EditableSelectField
          label="Role"
          name="role"
          value={selectedRole}
          options={[
            { label: "Moderator", value: UserRole.Moderator },
            { label: "Manager", value: UserRole.Manager },
            { label: "Promoter", value: UserRole.Promoter },
          ]}
          onChange={(value) => {
            setSelectedRole(value);
          }}
          onSave={handleSaveRole}
          isEditing={isEditing}
          isSaving={isLoading}
          error={error}
        />
        {/* {[UserRole.Admin, UserRole.Hostly_Admin, UserRole.Moderator].includes(
          userData.role as UserRole
        ) ? (
          <StaticField
            label="Role"
            value={roleMap[userData.role as UserRole] ?? "Not Set"}
          />
        ) : (
          <EditableSelectField
            label="Role"
            name="role"
            value={userData.role ?? ""}
            options={[
              { label: "Moderator", value: UserRole.Moderator },
              { label: "Manager", value: UserRole.Manager },
              { label: "Promoter", value: UserRole.Promoter },
            ]}
            onChange={(value) => setSelectedRole(value)}
            onSave={handleSaveRole}
            isEditing={isEditing}
            isSaving={isLoading}
            error={error}
          />
        )} */}

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
