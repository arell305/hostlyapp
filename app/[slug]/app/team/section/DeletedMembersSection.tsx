import { OrganizationSchema } from "@/types/types";
import { useQuery } from "convex/react";
import React from "react";
import {
  handleQueryComponentState,
  handleQueryState,
} from "../../../../../utils/handleQueryState";
import { QueryState, ResponseStatus } from "@/types/enums";
import { api } from "../../../../../convex/_generated/api";
import CustomCard from "@/components/shared/cards/CustomCard";
import MemberCard from "../MemberCard";
import { UserSchema } from "@/types/schemas-types";
import { sortUsersByName } from "../../../../../utils/helpers";
import MemberCardSkeleton from "../../components/loading/MemberCardSkeleton";
import MessagePage from "@/components/shared/shared-page/MessagePage";

interface DeletedMembersSectionProps {
  organization: OrganizationSchema;
}
const DeletedMembersSection = ({
  organization,
}: DeletedMembersSectionProps) => {
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
