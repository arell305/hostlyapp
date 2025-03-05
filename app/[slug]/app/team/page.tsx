"use client";
import { Protect, useAuth, useClerk } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PendingInvitationUser } from "@/types/types";
import MemberCard from "./MemberCard";
import {
  ClerkPermissions,
  ResponseStatus,
  UserRole,
} from "../../../../utils/enum";
import { useToast } from "@/hooks/use-toast";
import PendingUserCard from "./PendingUserCard";
import ResponsiveConfirm from "@/[slug]/app/components/responsive/ResponsiveConfirm";
import ResponsiveInviteUser from "../components/responsive/ResponsiveInviteUser";
import { useParams } from "next/navigation";
import { UserSchema } from "@/types/schemas-types";
import FullLoading from "../components/loading/FullLoading";
import ErrorComponent from "../components/errors/ErrorComponent";

const Team = () => {
  const { organization, user } = useClerk();
  const { slug } = useParams();
  const { toast } = useToast();
  const { orgRole } = useAuth();

  const isHostlyAdmin =
    orgRole === UserRole.Hostly_Admin || orgRole === UserRole.Hostly_Moderator;

  const cleanSlug =
    typeof slug === "string" ? slug.split("?")[0].toLowerCase() : "";

  const isHostlyPage = cleanSlug === "admin";

  const companyUsersData = useQuery(
    api.organizations.getUsersByOrganizationSlug,
    cleanSlug ? { slug: cleanSlug } : "skip"
  );

  const getPendingInvitationList = useAction(
    api.clerk.getPendingInvitationList
  );

  const [companyMembers, setCompanyMembers] = useState<UserSchema[]>([]);
  const [deltedMembers, setDeletedMembers] = useState<UserSchema[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showRevokeConfirm, setShowRevokeConfirm] = useState<boolean>(false);
  const [errorRevoke, setErrorRevoke] = useState<string | null>(null);
  const [isRevokeLoading, setIsRevokeLoading] = useState<boolean>(false);
  const [revokeUserId, setRevokeUserId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"active" | "pending" | "deleted">(
    "active"
  );
  const [pendingUsers, setPendingUsers] = useState<PendingInvitationUser[]>([]);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);

  const fetchData = async () => {
    if (!companyUsersData) {
      return;
    }
    if (companyUsersData.status === ResponseStatus.ERROR) {
      setError(companyUsersData.error);
    } else {
      const allUsers = companyUsersData.data?.users ?? [];
      const activeUsers = allUsers
        .filter((user) => user.isActive)
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
      const deletedMembers = allUsers
        .filter((user) => !user.isActive)
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));

      setCompanyMembers(activeUsers);
      setDeletedMembers(deletedMembers);
    }

    try {
      if (companyUsersData.data?.clerkOrganizationId) {
        const membership = await getPendingInvitationList({
          clerkOrgId: companyUsersData.data?.clerkOrganizationId,
        });
        if (membership.data?.pendingInvitationUsers) {
          setPendingUsers(membership.data.pendingInvitationUsers);
        }
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
  }, [getPendingInvitationList, companyUsersData]);

  const revokeOrganizationInvitation = useAction(
    api.clerk.revokeOrganizationInvitation
  );

  const handleShowRevokeConfirmation = (clerkInvitationId: string) => {
    setRevokeUserId(clerkInvitationId);
    setShowRevokeConfirm(true);
  };

  const handleRevokeConfirmation = async () => {
    setErrorRevoke(null);
    if (!revokeUserId) {
      setErrorRevoke("Error finding invitation");
      return;
    }
    if (!companyUsersData?.data) {
      setErrorRevoke("Error loading company");
      return;
    }
    setIsRevokeLoading(true);
    try {
      const result = await revokeOrganizationInvitation({
        clerkOrgId: companyUsersData?.data?.clerkOrganizationId,
        clerkInvitationId: revokeUserId,
      });

      if (result.status === ResponseStatus.ERROR) {
        console.log(result.error);
        setErrorRevoke("Error revoking invitation");
      } else {
        toast({
          title: "Invitation Revoked",
          description: "The invitation has successfully been revoked.",
        });
        setShowRevokeConfirm(false);
        fetchData();
      }
    } catch (error) {
      setErrorRevoke("Failed to revoke invitation");
      console.error("Failed to revoke invitation:", error);
    } finally {
      setIsRevokeLoading(false);
    }
  };

  const handleInviteSuccess = (newPendingUser: PendingInvitationUser) => {
    setPendingUsers((prev) => [...prev, newPendingUser]);
  };

  const isReady = organization && user && !loadingMembers;

  if (!isReady) {
    return <FullLoading />;
  }
  if (error) {
    return <ErrorComponent message={error} />;
  }
  return (
    <div className="justify-center  max-w-3xl  mx-auto mt-1.5 md:min-h-[300px]">
      <div className="flex justify-between items-center w-full px-4 pt-4 md:pt-0 mb-4">
        <h1 className=" text-3xl md:text-4xl font-bold ">Team Members</h1>
        <Protect
          condition={(has) =>
            has({ permission: ClerkPermissions.CREATE_EVENT }) ||
            (has({ permission: ClerkPermissions.MODERATES_APP }) &&
              cleanSlug === "admin")
          }
        >
          <p
            onClick={() => setIsInviteModalOpen(true)}
            className="font-semibold  hover:cursor-pointer hover:underline text-customDarkBlue"
          >
            Invite
          </p>
        </Protect>
      </div>
      <Protect
        condition={(has) =>
          has({ permission: ClerkPermissions.CREATE_EVENT }) ||
          has({ permission: ClerkPermissions.MODERATES_APP })
        }
      >
        <div className="relative w-full mb-1.5">
          {/* Tab container */}
          <div className="flex justify-between w-full relative">
            {/* Light gray line */}
            <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gray-300"></div>

            {/* Tabs */}
            <button
              className={`tab pb-2 flex-1 text-center ${
                activeTab === "active"
                  ? "font-bold text-black"
                  : "hover:underline text-gray-600"
              }`}
              onClick={() => setActiveTab("active")}
            >
              Active
            </button>
            <button
              className={`tab pb-2 flex-1 text-center ${
                activeTab === "pending"
                  ? "font-bold text-black"
                  : "hover:underline text-gray-600"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              Pending
            </button>
            <button
              className={`tab pb-2 flex-1 text-center ${
                activeTab === "deleted"
                  ? "font-bold text-black"
                  : "hover:underline text-gray-600"
              }`}
              onClick={() => setActiveTab("deleted")}
            >
              Deleted
            </button>
          </div>
          {/* Active underline */}
          <div
            className="absolute rounded left-0 bottom-0 h-[3px] bg-customDarkBlue transition-all duration-300 ease-in-out"
            style={{
              width: "33.33%",
              transform:
                activeTab === "active"
                  ? "translateX(0%)"
                  : activeTab === "pending"
                    ? "translateX(100%)"
                    : "translateX(200%)",
            }}
          />
        </div>
      </Protect>
      {activeTab === "active" && (
        <div className="w-full">
          {companyMembers.map((member) => (
            <MemberCard
              key={member.clerkUserId}
              name={member.name}
              role={member.role as UserRole}
              imageUrl={member.imageUrl}
              clerkUserId={member.clerkUserId || ""}
              isCurrentUser={user.id === member.clerkUserId}
            />
          ))}
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
                role={pendingUser.role as UserRole}
                onRevoke={handleShowRevokeConfirmation}
                isHostlyPage={isHostlyPage}
              />
            ))
          )}
        </div>
      )}
      {activeTab === "deleted" && (
        <div className="w-full">
          {deltedMembers.length === 0 ? (
            <p className="text-center text-gray-500 mt-4">No deleted users.</p>
          ) : (
            deltedMembers.map((member) => (
              <MemberCard
                key={member.clerkUserId}
                name={member.name}
                role={member.role as UserRole}
                imageUrl={member.imageUrl}
                clerkUserId={member.clerkUserId || ""}
                isCurrentUser={user.id === member.clerkUserId}
              />
            ))
          )}
        </div>
      )}
      <ResponsiveInviteUser
        isOpen={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        clerkOrganizationId={organization.id}
        onInviteSuccess={handleInviteSuccess}
        isHostlyAdmin={isHostlyAdmin}
      />
      <ResponsiveConfirm
        isOpen={showRevokeConfirm}
        title="Confirm User Revocation"
        confirmText="Revoke User"
        cancelText="Cancel"
        content="Are you sure you want to revoke this invitation? This action cannot be undone."
        confirmVariant="destructive"
        modalProps={{
          onClose: () => setShowRevokeConfirm(false),
          onConfirm: handleRevokeConfirmation,
        }}
        drawerProps={{
          onOpenChange: (open: boolean) => setShowRevokeConfirm(open),
          onSubmit: handleRevokeConfirmation,
        }}
        error={errorRevoke}
        isLoading={isRevokeLoading}
      />
    </div>
  );
};

export default Team;
