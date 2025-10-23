"use client";
import { useState } from "react";
import ResponsiveInviteUser from "@shared/ui/responsive/ResponsiveInviteUser";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import ToggleTabs from "@shared/ui/toggle/ToggleTabs";
import PendingMembersSection from "@/features/users/components/section/PendingMembersSection";
import { Button } from "@shared/ui/primitive/button";
import { Plus } from "lucide-react";
import { isAdminOrg, isManager } from "@/shared/utils/permissions";
import PageContainer from "@shared/ui/containers/PageContainer";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import GetUsersByCompany from "@/features/companies/components/GetUsersByCompany";

const TeamPage = () => {
  const { organization, orgRole } = useContextOrganization();
  const canManageTeam = isManager(orgRole);
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
            <Button
              className="w-[110px]"
              onClick={() => setIsInviteModalOpen(true)}
              size="heading"
            >
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
        <GetUsersByCompany isActive={true} organizationId={organization._id} />
      )}
      {selectedTab === "pending" && (
        <PendingMembersSection canManageTeam={canManageTeam} />
      )}
      {selectedTab === "deleted" && (
        <GetUsersByCompany isActive={false} organizationId={organization._id} />
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

export default TeamPage;
