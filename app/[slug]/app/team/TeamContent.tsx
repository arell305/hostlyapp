import React, { useState } from "react";
import { OrganizationSchema, UserSchema } from "@/types/types";
import ResponsiveInviteUser from "../components/responsive/ResponsiveInviteUser";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import ToggleTabs from "@/components/shared/toggle/ToggleTabs";
import ActiveMembersSection from "./section/ActiveMembersSection";
import DeletedMembersSection from "./section/DeletedMembersSection";
import PendingMembersSection from "./section/PendingMembersSection";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { isAdminOrg } from "@/utils/permissions";

interface TeamContentProps {
  canManageTeam: boolean;
  organization: OrganizationSchema;
  handleMemberClick: (user: UserSchema) => void;
}

const TeamContent = ({
  canManageTeam,
  organization,
  handleMemberClick,
}: TeamContentProps) => {
  const [selectedTab, setSelectedTab] = useState<
    "active" | "pending" | "deleted"
  >("active");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const isAdminSlug = isAdminOrg(organization.slug);
  return (
    <div className="space-y-6">
      <SectionHeaderWithAction
        title="Team Members"
        actions={
          canManageTeam && (
            <Button onClick={() => setIsInviteModalOpen(true)} size="heading">
              <Plus size={20} />
              <span>Member</span>
            </Button>
          )
        }
      />
      {canManageTeam && (
        <ToggleTabs
          options={[
            { label: "Active", value: "active" },
            { label: "Pending", value: "pending" },
            { label: "Deleted", value: "deleted" },
          ]}
          value={selectedTab}
          onChange={setSelectedTab}
        />
      )}
      {selectedTab === "active" && (
        <ActiveMembersSection
          organization={organization}
          handleMemberClick={(user) => {
            // Cast user to expected type before passing to handler
            handleMemberClick(user as UserSchema);
          }}
        />
      )}
      {selectedTab === "pending" && (
        <PendingMembersSection
          organization={organization}
          canManageTeam={canManageTeam}
        />
      )}
      {selectedTab === "deleted" && (
        <DeletedMembersSection
          organization={organization}
          handleMemberClick={(user) => {
            // Cast user to expected type before passing to handler
            handleMemberClick(user as UserSchema);
          }}
        />
      )}

      <ResponsiveInviteUser
        isOpen={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        clerkOrganizationId={organization.clerkOrganizationId}
        canManageTeam={canManageTeam}
        isAdminSlug={isAdminSlug}
      />
    </div>
  );
};

export default TeamContent;
