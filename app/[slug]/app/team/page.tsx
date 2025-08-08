"use client";
import React, { useState } from "react";
import ResponsiveInviteUser from "../components/responsive/ResponsiveInviteUser";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import ToggleTabs from "@/components/shared/toggle/ToggleTabs";
import ActiveMembersSection from "./section/ActiveMembersSection";
import DeletedMembersSection from "./section/DeletedMembersSection";
import PendingMembersSection from "./section/PendingMembersSection";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { isAdminOrg, isManager } from "@/utils/permissions";
import PageContainer from "@/components/shared/containers/PageContainer";
import { useContextOrganization } from "@/contexts/OrganizationContext";

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
      {selectedTab === "active" && <ActiveMembersSection />}
      {selectedTab === "pending" && (
        <PendingMembersSection canManageTeam={canManageTeam} />
      )}
      {selectedTab === "deleted" && <DeletedMembersSection />}

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
