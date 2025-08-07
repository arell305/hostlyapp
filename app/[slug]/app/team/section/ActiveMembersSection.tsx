"use client";
import { useQuery } from "convex/react";
import React from "react";
import { OrganizationSchema } from "@/types/types";
import { api } from "../../../../../convex/_generated/api";
import { ResponseStatus } from "@/types/enums";
import CustomCard from "@/components/shared/cards/CustomCard";
import MemberCard from "../MemberCard";
import MemberCardSkeleton from "../../components/loading/MemberCardSkeleton";
import MessagePage from "@/components/shared/shared-page/MessagePage";

interface ActiveMembersSectionProps {
  organization: OrganizationSchema;
}
const ActiveMembersSection = ({ organization }: ActiveMembersSectionProps) => {
  const companyUsersData = useQuery(api.organizations.getUsersByOrganization, {
    organizationId: organization._id,
    isActive: true,
  });

  const isLoading = companyUsersData === undefined;

  if (isLoading) {
    return <MemberCardSkeleton />;
  }

  if (companyUsersData.status === ResponseStatus.ERROR) {
    return (
      <MessagePage
        title="Error"
        description={companyUsersData.error}
        buttonLabel="Home"
      />
    );
  }

  return (
    <CustomCard className="p-0">
      {companyUsersData.data.users.map((member) => (
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
