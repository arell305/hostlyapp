"use client";
import { useAuth } from "@clerk/nextjs";
import TeamContent from "./TeamContent";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import FullLoading from "../components/loading/FullLoading";

const TeamPage = () => {
  const { orgRole } = useAuth();
  const { organization } = useContextOrganization();

  if (!orgRole || !organization) {
    return <FullLoading />;
  }

  return <TeamContent orgRole={orgRole} organization={organization} />;
};

export default TeamPage;
