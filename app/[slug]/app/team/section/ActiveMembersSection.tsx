"use client";
import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../../../convex/_generated/api";
import { QueryState } from "@/types/enums";
import CustomCard from "@/components/shared/cards/CustomCard";
import MemberCard from "../MemberCard";
import { handleQueryComponentState } from "@/utils/handleQueryState";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import MemberCardSkeleton from "@/components/shared/skeleton/MemberCardSkeleton";

const ActiveMembersSection = () => {
  const { organization } = useContextOrganization();
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
