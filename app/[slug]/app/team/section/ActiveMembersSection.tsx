"use client";
import { useQuery } from "convex/react";
import React from "react";
import { OrganizationSchema } from "@/types/types";
import { api } from "../../../../../convex/_generated/api";
import { QueryState } from "@/types/enums";
import CustomCard from "@/components/shared/cards/CustomCard";
import MemberCard from "../MemberCard";
import MemberCardSkeleton from "../../components/loading/MemberCardSkeleton";
import { handleQueryComponentState } from "@/utils/handleQueryState";

interface ActiveMembersSectionProps {
  organization: OrganizationSchema;
}
const ActiveMembersSection = ({ organization }: ActiveMembersSectionProps) => {
  const companyUsersData = useQuery(api.organizations.getUsersByOrganization, {
    organizationId: organization._id,
    isActive: true,
  });

  const result = handleQueryComponentState(companyUsersData, {
    loadingComponent: <MemberCardSkeleton />,
  });

  if (result.type === QueryState.Loading || result.type === QueryState.Error) {
    return result.element;
  }

  return (
    <CustomCard className="p-0">
      {result.data?.users.map((member) => (
        <MemberCard
          key={member.clerkUserId}
          user={member}
          slug={organization.slug}
        />
      ))}
    </CustomCard>
  );
};

export default ActiveMembersSection;
