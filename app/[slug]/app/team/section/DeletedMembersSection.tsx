import React from "react";
import CustomCard from "@/components/shared/cards/CustomCard";
import MemberCard from "../MemberCard";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { Doc } from "convex/_generated/dataModel";

interface DeletedMembersSectionProps {
  users: Doc<"users">[];
}
const DeletedMembersSection = ({ users }: DeletedMembersSectionProps) => {
  const { organization } = useContextOrganization();

  if (users.length === 0) {
    return <p className=" text-grayText">No deleted members.</p>;
  }

  return (
    <CustomCard className="p-0">
      {users.map((member) => (
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
