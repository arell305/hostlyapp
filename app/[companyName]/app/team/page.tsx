"use client";
import {
  Protect,
  useAuth,
  useClerk,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Membership, PendingInvitationUser } from "@/types/types";
import MemberCard from "./MemberCard";
import { ResponseStatus, UserRole } from "../../../../utils/enum";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "@/hooks/use-toast";
import PendingUserCard from "./PendingUserCard";
import { PiPlusCircle } from "react-icons/pi";
import SkeletonMemberCard from "../components/loading/MemberCardSkeleton";
import ResponsiveConfirm from "@/[companyName]/app/components/responsive/ResponsiveConfirm";
import ResponsiveInviteUser from "../components/responsive/ResponsiveInviteUser";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";

const Team = () => {
  const { organization, user, loaded } = useClerk();
  const { companyName } = useParams();
  const { toast } = useToast();
  const { isLoaded, orgRole } = useAuth();

  const isHostlyAdmin =
    orgRole === UserRole.Hostly_Admin || orgRole === UserRole.Hostly_Moderator;

  const cleanCompanyName =
    typeof companyName === "string"
      ? companyName.split("?")[0].toLowerCase()
      : "";

  const isHostlyPage = cleanCompanyName === "admin";

  const organizationData = useQuery(
    api.organizations.getOrganizationByNameQuery,
    cleanCompanyName ? { name: cleanCompanyName } : "skip"
  );

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
  const [showRevokeConfirm, setShowRevokeConfirm] = useState<boolean>(false);
  const [errorRevoke, setErrorRevoke] = useState<string | null>(null);
  const [isRevokeLoading, setIsRevokeLoading] = useState<boolean>(false);
  const [revokeUserId, setRevokeUserId] = useState<string | null>(null);

  const [selectedClerkUserId, setSelectedClerkUserId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");
  const [pendingUsers, setPendingUsers] = useState<PendingInvitationUser[]>([]);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);

  const fetchData = async () => {
    if (!organizationData) return;
    if (organizationData.data?.organization.clerkOrganizationId === undefined)
      return;
    setLoadingMembers(true);

    try {
      const [membershipResult, pendingResult] = await Promise.all([
        getOrganizationMembership({
          clerkOrgId: organizationData.data?.organization.clerkOrganizationId,
        }),
        getPendingInvitationList({
          clerkOrgId: organizationData.data?.organization.clerkOrganizationId,
        }),
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
  }, [getOrganizationMembership, getPendingInvitationList, organizationData]);

  const handleSaveRole = async (clerkUserId: string, role: UserRole) => {
    setOrganizationalMembership((prevMembers) =>
      prevMembers.map((member) =>
        member.clerkUserId === clerkUserId ? { ...member, role } : member
      )
    );
  };

  const revokeOrganizationInvitation = useAction(
    api.clerk.revokeOrganizationInvitation
  );

  const handleShowRevokeConfirmation = (clerkInvitationId: string) => {
    setRevokeUserId(clerkInvitationId);
    setShowRevokeConfirm(true);
  };

  const handleRevokeConfirmation = async () => {
    try {
      setIsRevokeLoading(true);
      if (organization && user && revokeUserId) {
        setIsRevokeLoading(true);
        const result = await revokeOrganizationInvitation({
          clerkOrgId: organization.id,
          clerkUserId: user.id,
          clerkInvitationId: revokeUserId,
        });

        if (result.status === ResponseStatus.SUCCESS) {
          // fetchData();
          toast({
            title: "Invitation Revoked",
            description: "The invitation has successfully been revoked.",
          });
          setShowRevokeConfirm(false);
          fetchData();
        } else {
          setErrorRevoke(result.error || "Failed to revoke invitation");
        }
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

  if (!isLoaded) {
    return;
  }
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
      <div className="flex justify-between items-center w-full px-4 pt-4 md:pt-0 mb-4">
        <h1 className=" text-3xl md:text-4xl font-bold ">Team Members</h1>
        <Protect
          condition={(has) =>
            has({ permission: "org:events:create" }) ||
            (has({ permission: "org:app:moderate" }) &&
              cleanCompanyName === "admin")
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
          has({ permission: "org:events:create" }) ||
          has({ permission: "org:app:moderate" })
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
              Active Users
            </button>
            <button
              className={`tab pb-2 flex-1 text-center ${
                activeTab === "pending"
                  ? "font-bold text-black"
                  : "hover:underline text-gray-600"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              Pending Users
            </button>
          </div>
          {/* Active underline */}
          <div
            className={`absolute rounded left-0 bottom-0 h-[3px] bg-customDarkBlue transition-all duration-300 ease-in-out`}
            style={{
              width: "50%",
              transform:
                activeTab === "active" ? "translateX(0)" : "translateX(100%)",
            }}
          />
        </div>
      </Protect>
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
                role={pendingUser.role}
                onRevoke={handleShowRevokeConfirmation}
                isHostlyPage={isHostlyPage}
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
