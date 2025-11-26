"use client";

import { useUsersByOrganization } from "@/domain/organizations";
import { Id } from "convex/_generated/dataModel";
import MemberCardSkeleton from "@/shared/ui/skeleton/MemberCardSkeleton";
import ActiveMembersFilter from "@/features/users/components/section/ActiveMembersFilter";
import DeletedMembersFilter from "@/features/users/components/section/DeletedMembersFilter";

interface GetUsersByCompanyProps {
  organizationId: Id<"organizations">;
  isActive: boolean;
}
const GetUsersByCompany: React.FC<GetUsersByCompanyProps> = ({
  organizationId,
  isActive,
}) => {
  const users = useUsersByOrganization(organizationId, isActive);

  if (!users) {
    return <MemberCardSkeleton />;
  }

  if (isActive) {
    return <ActiveMembersFilter users={users} />;
  }

  return <DeletedMembersFilter users={users} />;
};

export default GetUsersByCompany;
