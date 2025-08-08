import { useQuery } from "convex/react";
import React from "react";
import { handleQueryComponentState } from "../../../../../utils/handleQueryState";
import { QueryState } from "@/types/enums";
import { api } from "../../../../../convex/_generated/api";
import CustomCard from "@/components/shared/cards/CustomCard";
import MemberCard from "../MemberCard";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import MemberCardSkeleton from "@/components/shared/skeleton/MemberCardSkeleton";

interface DeletedMembersSectionProps {}
const DeletedMembersSection = ({}: DeletedMembersSectionProps) => {
  const { organization } = useContextOrganization();
  const companyUsersData = useQuery(api.organizations.getUsersByOrganization, {
    organizationId: organization._id,
    isActive: false,
  });

  const result = handleQueryComponentState(companyUsersData, {
    loadingComponent: <MemberCardSkeleton />,
  });

  if (result.type === QueryState.Loading || result.type === QueryState.Error) {
    return result.element;
  }

  const companyUsers = result.data?.users;

  if (companyUsers.length === 0) {
    return <p className=" text-grayText">No deleted members.</p>;
  }

  return (
    <CustomCard className="p-0">
      {companyUsers.map((member) => (
        <MemberCard
          key={member.clerkUserId}
          user={member}
          slug={organization.slug}
        />
      ))}
    </CustomCard>
  );
};

export default DeletedMembersSection;
