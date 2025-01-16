"use client";
import { useParams } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { notFound } from "next/navigation";
import { ResponseStatus, UserRole } from "../../../../../utils/enum";
import { ErrorMessages } from "@/types/enums";
import UserIdContent from "./UserIdContent";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import ResponsiveEditUser from "@/[companyName]/app/components/responsive/ResponsiveEditUser";
import { useEffect, useState } from "react";
import ResponsiveConfirm from "@/[companyName]/app/components/responsive/ResponsiveConfirm";
import { useToast } from "@/hooks/use-toast";

const UserWrapper = () => {
  const params = useParams();
  const currentClerkUserId = params.clerkUserId as string;
  const { has } = useAuth();
  const router = useRouter();
  const { organization, user, loaded } = useClerk();
  const [errorEditRole, setErrorEditRole] = useState<string | null>(null);
  const [loadingEditRole, setLoadingEditRole] = useState<boolean>(false);
  const [showResponsiveEditUser, setShowResponsiveEditUser] =
    useState<boolean>(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [errorDeleteUser, setErrorDeleteUser] = useState<string | null>(null);
  const [loadingDeleteUser, setLoadingDeleteUser] = useState<boolean>(false);
  const [userDeleted, setUserDeleted] = useState<boolean>(false);

  const onBack = () => {
    router.back();
  };
  const { toast } = useToast();

  const updateOrganizationMemberships = useAction(
    api.clerk.updateOrganizationMemberships
  );
  const deleteClerkUser = useAction(api.clerk.deleteClerkUser);

  const userFromDb = useQuery(api.users.findUserByClerkId, {
    clerkUserId: currentClerkUserId,
  });

  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (userFromDb?.data?.user?.role) {
      setRole(userFromDb.data.user.role as UserRole);
    }
  }, [userFromDb?.data?.user?.role]);

  useEffect(() => {
    if (userDeleted) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 3000); // Navigate after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [userDeleted, router]);

  const handleShowEditUser = () => {
    setShowResponsiveEditUser(true);
  };

  const handleSaveRole = async () => {
    if (!organization || !role) {
      return;
    }

    if (userFromDb?.data?.user?.role === role) {
      return setShowResponsiveEditUser(false);
    }
    setErrorEditRole(null);
    setLoadingEditRole(true);
    try {
      const response = await updateOrganizationMemberships({
        clerkOrgId: organization.id, // Get the organization ID from the user data
        clerkUserId: currentClerkUserId, // Pass the current Clerk user ID
        role, // Use the state directly
      });
      if (response.status === ResponseStatus.SUCCESS) {
        return setShowResponsiveEditUser(false);
      } else {
        setErrorEditRole(response.error);
      }
    } catch (error) {
      console.error("Unexpected error occurred:", error);
      setErrorEditRole("Unexpected error occurred");
    } finally {
      setLoadingEditRole(false);
    }
  };

  const handleShowDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteUser = async () => {
    setUserDeleted(true); // Set this to true immediately
    setShowDeleteConfirmation(false);
    setLoadingDeleteUser(true);

    try {
      const response = await deleteClerkUser({
        clerkUserId: currentClerkUserId,
      });

      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "User deleted",
          description: "The user has successfully been deleted",
        });
        // Don't navigate here, let the useEffect handle it
      } else {
        console.error("Failed to delete user:", response.error);
        toast({
          title: "Error",
          description: "Failed to delete the user. Please try again.",
          variant: "destructive",
        });
        setUserDeleted(false); // Reset if deletion failed
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({
        title: "Error",
        description: "Failed to delete the user. Please try again.",
        variant: "destructive",
      });
      setUserDeleted(false); // Reset if deletion failed
    } finally {
      setLoadingDeleteUser(false);
    }
  };

  if (userDeleted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white shadow-xl rounded-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            User Deleted
          </h1>
          <p className="text-gray-600">
            This user has been successfully deleted. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  if (!userFromDb || !has) {
    return <div>Loading...</div>; // Or any loading indicator
  }

  // make this into function
  if (userFromDb.status === ResponseStatus.ERROR) {
    if (userFromDb.error === ErrorMessages.NOT_FOUND) {
      return notFound(); // This will trigger Next.js 404 page
    } else if (userFromDb.error === ErrorMessages.UNAUTHENTICATED) {
      return <p>Unauthenticated</p>;
    } else if (userFromDb.error === ErrorMessages.FORBIDDEN) {
      return <p>Forbidden</p>;
    } else {
      return <p>Unkown Error</p>;
    }
  }

  const isAdmin = has({ role: UserRole.Admin });
  console.log("admin", isAdmin);

  return (
    <>
      <UserIdContent
        currentClerkUserId={currentClerkUserId}
        userData={userFromDb.data.user}
        onBack={onBack}
        onDelete={handleShowDeleteConfirmation}
        onEdit={handleShowEditUser}
        has={has}
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
