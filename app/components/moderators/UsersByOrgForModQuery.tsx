import { useContextOrganization } from "@/contexts/OrganizationContext";
import { useUsersByOrgForMod } from "@/hooks/convex/organizations";
import React from "react";
import MemberCardSkeleton from "../shared/skeleton/MemberCardSkeleton";
import UsersByOrgForModContent from "./UsersByOrgForModContent";

interface UsersByOrgForModQueryProps {
  page: string;
}

const UsersByOrgForModQuery = ({ page }: UsersByOrgForModQueryProps) => {
  const { organization } = useContextOrganization();

  const users = useUsersByOrgForMod(organization._id);

  if (!users) {
    return <MemberCardSkeleton />;
  }

  return (
    <UsersByOrgForModContent
      users={users}
      slug={organization.slug}
      page={page}
    />
  );
};

export default UsersByOrgForModQuery;
