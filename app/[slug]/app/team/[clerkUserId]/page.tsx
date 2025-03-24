"use client";
import { useParams } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { FrontendErrorMessages, ResponseStatus, UserRole } from "@/types/enums";
import UserIdContent from "./UserIdContent";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import ResponsiveEditUser from "@/[slug]/app/components/responsive/ResponsiveEditUser";
import { useEffect, useState } from "react";
import ResponsiveConfirm from "@/[slug]/app/components/responsive/ResponsiveConfirm";
import { useToast } from "@/hooks/use-toast";
import FullLoading from "../../components/loading/FullLoading";
import ErrorComponent from "../../components/errors/ErrorComponent";

const UserWrapper = () => {
  const params = useParams();
  const currentClerkUserId = params.clerkUserId as string;
  const { has } = useAuth();
  const router = useRouter();
  const { user } = useClerk();
  const [errorEditRole, setErrorEditRole] = useState<string | null>(null);
  const [loadingEditRole, setLoadingEditRole] = useState<boolean>(false);
  const [showResponsiveEditUser, setShowResponsiveEditUser] =
    useState<boolean>(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [errorDeleteUser, setErrorDeleteUser] = useState<string | null>(null);
  const [loadingDeleteUser, setLoadingDeleteUser] = useState<boolean>(false);

  const [errorResumeUser, setErrorReactivateUser] = useState<string | null>(
    null
  );
  const [loadingReactivate, setLoadingReactivateUser] =
    useState<boolean>(false);

  const onBack = () => {
    router.back();
  };
  const { toast } = useToast();

  const updateOrganizationMemberships = useAction(
    api.clerk.updateOrganizationMemberships
  );
  const updateUserByClerkId = useMutation(api.users.updateUserByClerkId);

  const userFromDb = useQuery(api.users.findUserByClerkId, {
    clerkUserId: currentClerkUserId,
  });

  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (userFromDb?.data?.user?.role) {
      setRole(userFromDb.data.user.role as UserRole);
    }
  }, [userFromDb?.data?.user?.role]);

  const handleShowEditUser = () => {
    console.log("show edit user");
    setShowResponsiveEditUser(true);
  };

  const handleSaveRole = async () => {
    setErrorEditRole(null);

    if (!role) {
      setErrorEditRole("Role not selected");
      return;
    }
    if (userFromDb?.data?.user?.role === role) {
      return setShowResponsiveEditUser(false);
    }

    if (!userFromDb?.data?.user.organizationId) {
      setErrorEditRole(FrontendErrorMessages.GENERIC_ERROR);
      return;
    }

    setLoadingEditRole(true);
    try {
      const response = await updateOrganizationMemberships({
        clerkUserId: currentClerkUserId,
        role,
      });
      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "User Updated",
          description: "The user role has successfully been updated",
        });
        return setShowResponsiveEditUser(false);
      } else {
        console.error(response.error);
        setErrorEditRole(FrontendErrorMessages.GENERIC_ERROR);
      }
    } catch (error) {
      console.error(FrontendErrorMessages.GENERIC_ERROR, error);
      setErrorEditRole(FrontendErrorMessages.GENERIC_ERROR);
    } finally {
      setLoadingEditRole(false);
    }
  };

  const handleShowDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteUser = async () => {
    setErrorDeleteUser(null);
    setLoadingDeleteUser(true);

    try {
      const response = await updateUserByClerkId({
        clerkUserId: currentClerkUserId,
        isActive: false,
      });

      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "User deleted",
          description: "The user has successfully been deleted",
        });
        setShowDeleteConfirmation(false);
      } else {
        console.error("Failed to delete user:", response.error);
        setErrorDeleteUser(FrontendErrorMessages.GENERIC_ERROR);
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      setErrorDeleteUser(FrontendErrorMessages.GENERIC_ERROR);
    } finally {
      setLoadingDeleteUser(false);
    }
  };

  const handleReactivateUser = async () => {
    setErrorReactivateUser(null);
    setLoadingReactivateUser(true);

    try {
      const response = await updateUserByClerkId({
        clerkUserId: currentClerkUserId,
        isActive: true,
      });

      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "User Reactivated",
          description: "The user has successfully been reactivated",
        });
        setShowDeleteConfirmation(false);
      } else {
        console.error("Failed to reactivate user:", response.error);
        setErrorReactivateUser(FrontendErrorMessages.GENERIC_ERROR);
      }
    } catch (error) {
      console.error("Failed to reactivate user:", error);
      setErrorReactivateUser(FrontendErrorMessages.GENERIC_ERROR);
    } finally {
      setLoadingReactivateUser(false);
    }
  };

  if (!userFromDb || !has || !user) {
    return <FullLoading />;
  }

  const isCurrentUser = currentClerkUserId === user?.id;

  if (userFromDb.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={userFromDb.error} />;
  }

  return (
    <>
      <UserIdContent
        userData={userFromDb.data.user}
        onBack={onBack}
        onDelete={handleShowDeleteConfirmation}
        onEdit={handleShowEditUser}
        has={has}
        isCurrentUser={isCurrentUser}
        onReactivateUser={handleReactivateUser}
        errorResumeUser={errorResumeUser}
        loadingReactivate={loadingReactivate}
        errorDeleteUser={errorDeleteUser}
        loadingDeleteUser={loadingDeleteUser}
      />
      {role !== null && (
        <ResponsiveEditUser
          selectedRole={role}
          setSelectedRole={setRole}
          onSaveRole={handleSaveRole}
          fullName={userFromDb?.data?.user?.name || ""}
          isLoading={loadingEditRole}
          error={errorEditRole}
          isOpen={showResponsiveEditUser}
          onOpenChange={setShowResponsiveEditUser}
        />
      )}

      <ResponsiveConfirm
        isOpen={showDeleteConfirmation}
        title="Confirm User Deletion"
        confirmText="Delete User"
        cancelText="Cancel"
        content="Are you sure you want to delete this user? This action cannot be undone."
        confirmVariant="destructive"
        error={errorDeleteUser}
        isLoading={loadingDeleteUser}
        modalProps={{
          onClose: () => setShowDeleteConfirmation(false),
          onConfirm: () => handleDeleteUser(),
        }}
        drawerProps={{
          onSubmit: handleDeleteUser,
          onOpenChange: (open) => setShowDeleteConfirmation(open),
        }}
      />
    </>
  );
};

export default UserWrapper;
