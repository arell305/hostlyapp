"use client";
import { useUser } from "@clerk/nextjs";
import TeamContent from "./TeamContent";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import FullLoading from "../components/loading/FullLoading";
import { isManager } from "@/utils/permissions";

const TeamPage = () => {
  const { organization, orgRole } = useContextOrganization();

  if (!organization) {
    return <FullLoading />;
  }

  const canManageTeam = isManager(orgRole);

  return (
    <TeamContent canManageTeam={canManageTeam} organization={organization} />
  );
};

export default TeamPage;
