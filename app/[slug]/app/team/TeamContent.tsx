import React, { useState } from "react";
import { OrganizationSchema } from "@/types/types";
import ResponsiveInviteUser from "../components/responsive/ResponsiveInviteUser";
import { isHostlyUser } from "../../../../utils/permissions";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import ToggleTabs from "@/components/shared/toggle/ToggleTabs";
import ActiveMembersSection from "./section/ActiveMembersSection";
import DeletedMembersSection from "./section/DeletedMembersSection";
import PendingMembersSection from "./section/PendingMembersSection";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TeamContentProps {
  orgRole: string;
  organization: OrganizationSchema;
}

const TeamContent = ({ orgRole, organization }: TeamContentProps) => {
  const [selectedTab, setSelectedTab] = useState<
    "active" | "pending" | "deleted"
  >("active");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);

  const isHostlyAdmin = isHostlyUser(orgRole);

  const handleInviteSuccess = () => {};

  return (
    <div className="space-y-6">
      <SectionHeaderWithAction
        title="Team Members"
        actions={
          <Button onClick={() => setIsInviteModalOpen(true)} size="heading">
            <Plus size={20} />
            <span>Member</span>
          </Button>
        }
      />

      <ToggleTabs
        options={[
          { label: "Active", value: "active" },
          { label: "Pending", value: "pending" },
          { label: "Deleted", value: "deleted" },
        ]}
        value={selectedTab}
        onChange={setSelectedTab}
      />
      {selectedTab === "active" && (
        <ActiveMembersSection organization={organization} />
      )}
      {selectedTab === "pending" && (
        <PendingMembersSection organization={organization} />
      )}
      {selectedTab === "deleted" && (
        <DeletedMembersSection organization={organization} />
      )}

      <ResponsiveInviteUser
        isOpen={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        clerkOrganizationId={organization.clerkOrganizationId}
        onInviteSuccess={handleInviteSuccess}
        isHostlyAdmin={isHostlyAdmin}
      />
    </div>
  );
};

export default TeamContent;
