"use client";
import { useQuery } from "convex/react";
import React from "react";
import { OrganizationSchema } from "@/types/types";
import { api } from "../../../../../convex/_generated/api";
import { handleQueryState } from "../../../../../utils/handleQueryState";
import { QueryState } from "@/types/enums";
import CustomCard from "@/components/shared/cards/CustomCard";
import MemberCard from "../MemberCard";
import { sortUsersByName } from "../../../../../utils/helpers";
import { UserSchema } from "@/types/schemas-types";

interface ActiveMembersSectionProps {
  organization: OrganizationSchema;
}
const ActiveMembersSection = ({ organization }: ActiveMembersSectionProps) => {
  const companyUsersData = useQuery(api.organizations.getUsersByOrganization, {
    organizationId: organization._id,
    isActive: true,
  });

  const result = handleQueryState(companyUsersData);

  if (result.type === QueryState.Loading || result.type === QueryState.Error) {
    return result.element;
  }

  const companyUsers: UserSchema[] = sortUsersByName(result.data.users);

  return (
    <CustomCard className="p-0">
      {companyUsers.map((member) => (
        <MemberCard key={member.clerkUserId} user={member} />
      ))}
    </CustomCard>
  );
};

export default ActiveMembersSection;
