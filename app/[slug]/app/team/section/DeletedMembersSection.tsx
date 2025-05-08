import { OrganizationSchema } from "@/types/types";
import { useQuery } from "convex/react";
import React from "react";
import { handleQueryState } from "../../../../../utils/handleQueryState";
import { QueryState } from "@/types/enums";
import { api } from "../../../../../convex/_generated/api";
import CustomCard from "@/components/shared/cards/CustomCard";
import MemberCard from "../MemberCard";
import { UserSchema } from "@/types/schemas-types";
import { sortUsersByName } from "../../../../../utils/helpers";
import EmptyList from "@/components/shared/EmptyList";

interface DeletedMembersSectionProps {
  organization: OrganizationSchema;
  handleMemberClick: (user: UserSchema) => void;
}
const DeletedMembersSection = ({
  organization,
  handleMemberClick,
}: DeletedMembersSectionProps) => {
  const companyUsersData = useQuery(api.organizations.getUsersByOrganization, {
    organizationId: organization._id,
    isActive: false,
  });

  const result = handleQueryState(companyUsersData);

  if (result.type === QueryState.Loading || result.type === QueryState.Error) {
    return result.element;
  }

  const companyUsers: UserSchema[] = sortUsersByName(result.data.users);

  return (
    <CustomCard className="p-0">
      <EmptyList items={companyUsers} message="No deleted members" />
      {companyUsers.map((member) => (
        <MemberCard
          key={member.clerkUserId}
          user={member}
          handleMemberClick={handleMemberClick}
        />
      ))}
    </CustomCard>
  );
};

export default DeletedMembersSection;
