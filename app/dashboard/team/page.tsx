// "use client";

// import { OrganizationProfile } from "@clerk/nextjs";
// import { FaTicket } from "react-icons/fa6";
// import OrgPromoCode from "./OrgPromoCode";

// const OrganizationProfilePage = () => (
//   <OrganizationProfile routing="hash">
//     <OrganizationProfile.Page
//       label="Team Promo Code"
//       labelIcon={<FaTicket />}
//       url="promoCode"
//     >
//       <OrgPromoCode />
//     </OrganizationProfile.Page>
//   </OrganizationProfile>
// );

// export default OrganizationProfilePage;
"use client";
import { useOrganization, useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import {
  OrganizationInvitation,
  OrganizationMembership,
} from "@clerk/clerk-sdk-node";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Membership, PendingInvitationUser } from "@/types";
import MemberCard from "./MemberCard";
import { UserRole } from "../../../utils/enum";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "@/hooks/use-toast";
import InviteUser from "./InviteUser";
import PendingUserCard from "./PendingUserCard";

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

  if (!isLoaded || !organization || !isUserLoaded || !user) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <div>
      <h1>Team Members</h1>
      {canManageUsers && (
        <>
          <div className="tabs space-x-4">
            <button
              className={`tab ${activeTab === "active" ? "active" : ""}`}
              onClick={() => setActiveTab("active")}
            >
              Active Members
            </button>
            <button
              className={`tab ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              Pending Users
            </button>
          </div>
          <InviteUser
            organizationId={organization.id}
            inviterUserId={user.id}
          />
        </>
      )}
      {activeTab === "active" && (
        <>
          {loadingMembers ? (
            <p>Loading active members...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {organizationalMembership.map((member) => (
                <MemberCard
                  key={member.clerkUserId} // Use userId as key
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
                    handleDelete(selectedClerkUserId); // Call delete with clerk user ID
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {pendingUsers.length > 0 ? (
                pendingUsers.map((pendingUser) => (
                  <PendingUserCard
                    key={pendingUser.clerkInvitationId}
                    clerkInvitationId={pendingUser.clerkInvitationId}
                    email={pendingUser.email}
                    role={pendingUser.role}
                    clerkUserId={user.id}
                    clerkOrgId={organization.id}
                    onRevoke={handleRevokeSuccess}
                  />
                ))
              ) : (
                <p>No pending users at the moment.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Team;
