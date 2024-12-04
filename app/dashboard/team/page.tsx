"use client";
import { useOrganization, useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Membership, PendingInvitationUser } from "@/types";
import MemberCard from "./MemberCard";
import { UserRole } from "../../../utils/enum";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "@/hooks/use-toast";
import PendingUserCard from "./PendingUserCard";
import { PiPlusCircle } from "react-icons/pi";
import InviteUserModal from "../components/modals/InviteUserModal";

const Team = () => {
  const { organization, isLoaded } = useOrganization();
  const { user, isLoaded: isUserLoaded } = useUser();
  const currentUserRole = user?.organizationMemberships[0].role as UserRole;
  const { toast } = useToast();

  const getOrganizationMembership = useAction(
    api.clerk.getOrganizationMemberships
  );
  const getPendingInvitationList = useAction(
    api.clerk.getPendingInvitationList
  );
  const [organizationalMembership, setOrganizationalMembership] = useState<
    Membership[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const updateOrganizationMemberships = useAction(
    api.clerk.updateOrganizationMemberships
  );
  const deleteClerkUser = useAction(api.clerk.deleteClerkUser);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const [selectedClerkUserId, setSelectedClerkUserId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");
  const [pendingUsers, setPendingUsers] = useState<PendingInvitationUser[]>([]);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);
  const [loadingPendingUsers, setLoadingPendingUsers] =
    useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);

  const canManageUsers =
    currentUserRole === UserRole.Admin || currentUserRole === UserRole.Manager;

  useEffect(() => {
    const fetchOrganizationalMembership = async () => {
      setLoadingMembers(true);
      try {
        if (organization) {
          const result = await getOrganizationMembership({
            clerkOrgId: organization.id,
          });
          setOrganizationalMembership(result);
        }
      } catch (err) {
        console.error("Error fetching organizational memberships:", err);
        setError("Failed to fetch organizational memberships.");
      } finally {
        setLoadingMembers(false);
      }
    };

    if (isLoaded && organization) {
      fetchOrganizationalMembership();
    }
  }, [getOrganizationMembership, organization, isLoaded]);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      setLoadingPendingUsers(true);
      try {
        if (organization && activeTab === "pending") {
          const result = await getPendingInvitationList({
            clerkOrgId: organization.id,
          });
          setPendingUsers(result);
          console.log("pending", pendingUsers);
        }
      } catch (err) {
        console.error("Error fetching pending users:", err);
        setError("Failed to fetch pending users.");
      } finally {
        setLoadingPendingUsers(false);
      }
    };

    if (activeTab === "pending") {
      fetchPendingUsers();
    }
  }, [activeTab, getPendingInvitationList, organization]);

  const handleSaveRole = async (clerkUserId: string, role: UserRole) => {
    try {
      if (organization) {
        await updateOrganizationMemberships({
          clerkOrgId: organization.id,
          clerkUserId,
          role,
        });
      }
      setOrganizationalMembership((prevMemberships) =>
        prevMemberships.map((member) =>
          member.clerkUserId === clerkUserId ? { ...member, role } : member
        )
      );
      toast({
        title: "Role Updated",
        description: "The role has successfully been updated",
      });
    } catch (error) {
      console.log("err", error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (clerkUserId: string) => {
    try {
      await deleteClerkUser({ clerkUserId });
      setOrganizationalMembership((prevMemberships) =>
        prevMemberships.filter((member) => member.clerkUserId !== clerkUserId)
      );
      toast({
        title: "User Deleted",
        description: "The user has successfully been deleted",
      });
    } catch (error) {
      console.log("err", error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again",
        variant: "destructive",
      });
    }
  };

  const handleRevokeSuccess = (clerkInvitationId: string) => {
    setPendingUsers((prev) =>
      prev.filter((user) => user.clerkInvitationId !== clerkInvitationId)
    );
  };

  const openConfirmModal = (clerkUserId: string) => {
    setSelectedClerkUserId(clerkUserId);
    setShowConfirmModal(true);
  };

  const closeModal = () => {
    setIsInviteModalOpen(false);
  };

  if (!isLoaded || !organization || !isUserLoaded || !user) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <div className="flex flex-col items-center justify-center md:border-2 max-w-3xl md:p-6 rounded-lg mx-auto">
      <div className="flex justify-between items-center w-full mb-4 px-10">
        <h1 className="text-3xl md:text-4xl font-bold">Team Members</h1>
        {canManageUsers && (
          <PiPlusCircle
            onClick={() => setIsInviteModalOpen(true)}
            className="text-3xl cursor-pointer"
          />
        )}
      </div>
      {canManageUsers && (
        <>
          <div className="relative w-full mb-4">
            <div className="flex justify-between w-full">
              <button
                className={`tab pb-2 flex-1 text-center ${activeTab === "active" ? "active" : ""}`}
                onClick={() => setActiveTab("active")}
              >
                Active Members
              </button>
              <button
                className={`tab pb-2 flex-1 text-center ${activeTab === "pending" ? "active" : ""}`}
                onClick={() => setActiveTab("pending")}
              >
                Pending Users
              </button>
            </div>
            {/* Underline element */}
            <div
              className={`absolute rounded bottom-0 left-0 h-1 bg-customDarkBlue transition-all duration-300 ease-in-out`}
              style={{
                width: activeTab === "active" ? "50%" : "50%",
                transform:
                  activeTab === "active" ? "translateX(0)" : "translateX(100%)",
              }}
            />
          </div>
        </>
      )}
      {activeTab === "active" && (
        <>
          {loadingMembers ? (
            <p>Loading active members...</p>
          ) : (
            <div className="w-full">
              {organizationalMembership.map((member) => (
                <MemberCard
                  key={member.clerkUserId}
                  firstName={member.firstName}
                  lastName={member.lastName}
                  role={member.role as UserRole}
                  imageUrl={member.imageUrl || ""}
                  clerkUserId={member.clerkUserId || ""}
                  clerkOrgId={organization.id}
                  onSaveRole={handleSaveRole}
                  onDelete={openConfirmModal}
                  isCurrentUser={user.id === member.clerkUserId}
                  currentUserRole={currentUserRole}
                />
              ))}
              <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={() => {
                  if (selectedClerkUserId) {
                    handleDelete(selectedClerkUserId);
                  }
                  setShowConfirmModal(false);
                }}
                title="Confirm User Deletion"
                message="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Delete User"
                cancelText="Cancel"
              />
            </div>
          )}
        </>
      )}
      {activeTab === "pending" && (
        <>
          {loadingPendingUsers ? (
            <p>Loading pending users members...</p>
          ) : (
            <div className="w-full">
              {pendingUsers.map((pendingUser) => (
                <PendingUserCard
                  key={pendingUser.clerkInvitationId}
                  clerkInvitationId={pendingUser.clerkInvitationId}
                  email={pendingUser.email}
                  role={pendingUser.role}
                  clerkUserId={user.id}
                  clerkOrgId={organization.id}
                  onRevoke={handleRevokeSuccess}
                />
              ))}
            </div>
          )}
        </>
      )}
      {isInviteModalOpen && (
        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={closeModal}
          clerkOrganizationId={organization.id}
          inviterUserClerkId={user.id}
        />
      )}
    </div>
  );
};

export default Team;
