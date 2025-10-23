"use client";

import { useUsersByOrganization } from "@/domain/organizations";
import MemberCardSkeleton from "@shared/ui/skeleton/MemberCardSkeleton";
import ActiveMembersSection from "@/features/users/components/section/ActiveMembersSection";
import { Id } from "convex/_generated/dataModel";
import DeletedMembersSection from "@/features/users/components/section/DeletedMembersSection";

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
    return <ActiveMembersSection users={users} />;
  } else {
    return <DeletedMembersSection users={users} />;
  }
};

export default GetUsersByCompany;
