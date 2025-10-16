import React from "react";
import { useUsersByOrganization } from "@/hooks/convex/organizations/useUsersByOrganization";
import MemberCardSkeleton from "../shared/skeleton/MemberCardSkeleton";
import ActiveMembersSection from "@/[slug]/app/team/section/ActiveMembersSection";
import { Id } from "convex/_generated/dataModel";
import DeletedMembersSection from "@/[slug]/app/team/section/DeletedMembersSection";

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
