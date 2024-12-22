"use client";
import { useClerk, useOrganization, useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Membership, PendingInvitationUser } from "@/types";
import MemberCard from "./MemberCard";
import { ResponseStatus, UserRole } from "../../../utils/enum";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "@/hooks/use-toast";
import PendingUserCard from "./PendingUserCard";
import { PiPlusCircle } from "react-icons/pi";
import InviteUserModal from "../components/modals/InviteUserModal";
import SkeletonMemberCard from "../components/loading/MemberCardSkeleton";
import ResponsiveConfirm from "@/dashboard/components/responsive/ResponsiveConfirm";
import ResponsiveInviteUser from "../components/responsive/ResponsiveInviteUser";

const Team = () => {
  const { organization, user, loaded } = useClerk();
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

  const deleteClerkUser = useAction(api.clerk.deleteClerkUser);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const [selectedClerkUserId, setSelectedClerkUserId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");
  const [pendingUsers, setPendingUsers] = useState<PendingInvitationUser[]>([]);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);

  const canManageUsers =
    currentUserRole === UserRole.Admin || currentUserRole === UserRole.Manager;

  const fetchData = async () => {
    if (!organization) return;

    setLoadingMembers(true);

    try {
      const [membershipResult, pendingResult] = await Promise.all([
        getOrganizationMembership({ clerkOrgId: organization.id }),
        getPendingInvitationList({ clerkOrgId: organization.id }),
      ]);

      if (membershipResult.data?.memberships) {
        setOrganizationalMembership(membershipResult.data.memberships);
      }

      if (pendingResult.data?.pendingInvitationUsers) {
        setPendingUsers(pendingResult.data.pendingInvitationUsers);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch organizational memberships or pending users.");
    } finally {
      setLoadingMembers(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [getOrganizationMembership, getPendingInvitationList, organization]);

  const handleSaveRole = async (clerkUserId: string, role: UserRole) => {
    setOrganizationalMembership((prevMembers) =>
      prevMembers.map((member) =>
        member.clerkUserId === clerkUserId ? { ...member, role } : member
      )
    );
  };

  const handleDelete = async (clerkUserId: string) => {
    try {
      const result = await deleteClerkUser({ clerkUserId });
      setOrganizationalMembership((prevMemberships) =>
        prevMemberships.filter((member) => member.clerkUserId !== clerkUserId)
      );
      if (result.status === ResponseStatus.SUCCESS) {
        toast({
          title: "User Deleted",
          description: "The user has successfully been deleted",
        });
      } else if (result.status === ResponseStatus.ERROR) {
        toast({
          title: "Error",
          description: "Failed to delete user. Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log("err", error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again",
        variant: "destructive",
      });
    }
  };
  const revokeOrganizationInvitation = useAction(
    api.clerk.revokeOrganizationInvitation
  );

  const handleRevoke = async (clerkInvitationId: string) => {
    try {
      if (organization && user) {
        const result = await revokeOrganizationInvitation({
          clerkOrgId: organization.id,
          clerkUserId: user.id,
          clerkInvitationId,
        });

        if (result.status === ResponseStatus.SUCCESS) {
          // fetchData();
          toast({
            title: "Invitation Revoked",
            description: "The invitation has successfully been revoked.",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to revoke invitation. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Failed to revoke invitation:", error);
      toast({
        title: "Error",
        description: "Failed to revoke invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openConfirmModal = (clerkUserId: string) => {
    setSelectedClerkUserId(clerkUserId);
    setShowConfirmModal(true);
  };

  const closeModal = () => {
    setIsInviteModalOpen(false);
  };

  const handleInviteSuccess = (newPendingUser: PendingInvitationUser) => {
    setPendingUsers((prev) => [...prev, newPendingUser]);
  };

  const isReady = organization && user && !loadingMembers;

  if (!isReady) {
    return (
      <div className="justify-center  max-w-3xl  mx-auto mt-1.5  md:min-h-[300px]">
        <div className="flex flex-col justify-between items-center w-full px-4 pt-6 mb-4">
          <SkeletonMemberCard />
          <SkeletonMemberCard />
        </div>
      </div>
    );
  }
  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <div className="justify-center  max-w-3xl  mx-auto mt-1.5 md:min-h-[300px]">
      <div className="flex justify-between items-center w-full px-4 pt-6 mb-4">
        <h1 className=" text-3xl md:text-4xl font-bold ">Team Members</h1>
        {canManageUsers && (
          <PiPlusCircle
            onClick={() => setIsInviteModalOpen(true)}
            className="text-4xl cursor-pointer text-gray-800 hover:text-gray-500"
          />
        )}
      </div>
      {canManageUsers && (
        <>
          <div className="relative w-full mb-1.5">
            <div className="flex justify-between w-full ">
              <button
                className={` tab pb-2 flex-1 text-center ${activeTab === "active" ? "active" : "hover:underline"}`}
                onClick={() => setActiveTab("active")}
              >
                Active Members
              </button>
              <button
                className={` tab pb-2 flex-1 text-center ${activeTab === "pending" ? "active" : "hover:underline"}`}
                onClick={() => setActiveTab("pending")}
              >
                Pending Users
              </button>
            </div>
            {/* Underline element */}
            <div
              className={`absolute rounded left-0 h-1 bg-customDarkBlue transition-all duration-300 ease-in-out`}
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

          <ResponsiveConfirm
            isOpen={showConfirmModal}
            title="Confirm User Deletion"
            confirmText="Delete User"
            cancelText="Cancel"
            content="Are you sure you want to delete this user? This action cannot be undone."
            confirmVariant="destructive"
            modalProps={{
              onClose: () => setShowConfirmModal(false),
              onConfirm: () => {
                if (selectedClerkUserId) {
                  handleDelete(selectedClerkUserId);
                }
                setShowConfirmModal(false);
              },
            }}
            drawerProps={{
              onOpenChange: setShowConfirmModal,
              onSubmit: () => {
                if (selectedClerkUserId) {
                  handleDelete(selectedClerkUserId);
                }
                setShowConfirmModal(false);
              },
            }}
          />
        </div>
      )}
      {activeTab === "pending" && (
        <div className="w-full">
          {pendingUsers.length === 0 ? (
            <p className="text-center text-gray-500 mt-4">No pending users.</p>
          ) : (
            pendingUsers.map((pendingUser) => (
              <PendingUserCard
                key={pendingUser.clerkInvitationId}
                clerkInvitationId={pendingUser.clerkInvitationId}
                email={pendingUser.email}
                role={pendingUser.role}
                clerkUserId={user.id}
                clerkOrgId={organization.id}
                onRevoke={handleRevoke}
              />
            ))
          )}
        </div>
      )}
      <ResponsiveInviteUser
        isOpen={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        clerkOrganizationId={organization.id}
        inviterUserClerkId={user.id}
        onInviteSuccess={handleInviteSuccess}
      />
    </div>
  );
};

export default Team;
