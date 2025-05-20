"use client";
import CustomCard from "@/components/shared/cards/CustomCard";
import { useAction } from "convex/react";
import React, { useCallback, useEffect, useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { OrganizationSchema, PendingInvitationUser } from "@/types/types";
import ErrorComponent from "../../components/errors/ErrorComponent";
import PendingUserCard from "../PendingUserCard";
import ResponsiveConfirm from "../../components/responsive/ResponsiveConfirm";
import { useRevokeInvitation } from "../hooks/useRevokeInvitation";
import MemberCardSkeleton from "../../components/loading/MemberCardSkeleton";

interface PendingMembersSectionProps {
  organization: OrganizationSchema;
  canManageTeam: boolean;
}

const PendingMembersSection = ({
  organization,
  canManageTeam,
}: PendingMembersSectionProps) => {
  const [pendingUsers, setPendingUsers] = useState<PendingInvitationUser[]>([]);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [revokeUserId, setRevokeUserId] = useState<string | null>(null);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState<boolean>(false);

  const getPendingInvitationList = useAction(
    api.clerk.getPendingInvitationList
  );
  const {
    revokeInvitation,
    isLoading,
    error: errorRevoke,
    setError: setErrorRevoke,
  } = useRevokeInvitation();

  const handleShowRevokeConfirmation = (clerkInvitationId: string) => {
    setRevokeUserId(clerkInvitationId);
    setShowRevokeConfirm(true);
  };
  const handleClose = () => {
    setRevokeUserId(null);
    setShowRevokeConfirm(false);
    setErrorRevoke(null);
    fetchData();
  };

  const handleRevokeConfirmation = async () => {
    if (!revokeUserId) {
      setErrorRevoke("Error finding invitation");
      return;
    }
    try {
      const success = await revokeInvitation(
        organization.clerkOrganizationId,
        revokeUserId,
        organization._id
      );
      if (success) {
        handleClose();
      }
    } catch (err) {
      console.error("Error revoking invitation:", err);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoadingMembers(true);
      const membership = await getPendingInvitationList({
        clerkOrgId: organization.clerkOrganizationId,
      });

      if (membership.data?.pendingInvitationUsers) {
        setPendingUsers(membership.data.pendingInvitationUsers);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch organizational memberships or pending users.");
    } finally {
      setLoadingMembers(false);
    }
  }, [
    setError,
    setPendingUsers,
    setLoadingMembers,
    getPendingInvitationList,
    organization.clerkOrganizationId,
  ]);

  useEffect(() => {
    fetchData();
  }, [organization, getPendingInvitationList, fetchData]);

  if (loadingMembers) {
    return <MemberCardSkeleton />;
  }

  if (error) {
    return <ErrorComponent message={error} />;
  }

  if (pendingUsers.length === 0 && !loadingMembers) {
    return <p>No pending members</p>;
  }

  return (
    <>
      <CustomCard className="p-0">
        {pendingUsers.map((user) => (
          <PendingUserCard
            key={user.clerkInvitationId}
            user={user}
            onRevoke={handleShowRevokeConfirmation}
            canManageTeam={canManageTeam}
          />
        ))}
      </CustomCard>
      <ResponsiveConfirm
        isOpen={showRevokeConfirm}
        title="Confirm User Revocation"
        confirmText="Revoke User"
        cancelText="Cancel"
        content="Are you sure you want to revoke this invitation? This action cannot be undone."
        confirmVariant="destructive"
        modalProps={{
          onClose: handleClose,
          onConfirm: handleRevokeConfirmation,
        }}
        drawerProps={{
          onOpenChange: (open: boolean) => {
            if (!open) handleClose();
          },
          onSubmit: handleRevokeConfirmation,
        }}
        error={errorRevoke}
        isLoading={isLoading}
      />
    </>
  );
};

export default PendingMembersSection;
