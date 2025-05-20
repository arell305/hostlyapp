import React, { useState } from "react";
import { OrganizationSchema } from "@/types/types";
import ResponsiveInviteUser from "../components/responsive/ResponsiveInviteUser";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import ToggleTabs from "@/components/shared/toggle/ToggleTabs";
import ActiveMembersSection from "./section/ActiveMembersSection";
import DeletedMembersSection from "./section/DeletedMembersSection";
import PendingMembersSection from "./section/PendingMembersSection";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { isAdminOrg } from "@/utils/permissions";
import PageContainer from "@/components/shared/containers/PageContainer";
interface TeamContentProps {
  canManageTeam: boolean;
  organization: OrganizationSchema;
}

const TeamContent = ({ canManageTeam, organization }: TeamContentProps) => {
  const [selectedTab, setSelectedTab] = useState<
    "active" | "pending" | "deleted"
  >("active");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const isAdminSlug = isAdminOrg(organization.slug);
  return (
    <PageContainer>
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
        <ActiveMembersSection organization={organization} />
      )}
      {selectedTab === "pending" && (
        <PendingMembersSection
          organization={organization}
          canManageTeam={canManageTeam}
        />
      )}
      {selectedTab === "deleted" && (
        <DeletedMembersSection organization={organization} />
      )}

      <ResponsiveInviteUser
        isOpen={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        clerkOrganizationId={organization.clerkOrganizationId}
        isAdminSlug={isAdminSlug}
      />
    </PageContainer>
  );
};

export default TeamContent;
