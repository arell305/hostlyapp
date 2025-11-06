"use client";

import { useContextOrganization } from "@/shared/hooks/contexts";
import { useUsersByOrgForMod } from "@/domain/organizations";
import MemberCardSkeleton from "@shared/ui/skeleton/MemberCardSkeleton";
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
