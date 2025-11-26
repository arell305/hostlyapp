"use client";

import CustomCard from "@shared/ui/cards/CustomCard";
import MemberCard from "../MemberCard";
import { useContextOrganization } from "@/shared/hooks/contexts/useContextOrganization";
import { Doc } from "convex/_generated/dataModel";

interface ActiveMembersSectionProps {
  users: Doc<"users">[];
}
const ActiveMembersSection = ({ users }: ActiveMembersSectionProps) => {
  const { organization } = useContextOrganization();

  if (users.length === 0) {
    return <p className="text-grayText">No users found.</p>;
  }

  return (
    <CustomCard className="p-0">
      {users.map((member) => (
        <MemberCard key={member._id} user={member} slug={organization.slug} />
      ))}
    </CustomCard>
  );
};

export default ActiveMembersSection;
