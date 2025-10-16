import React from "react";
import { Doc } from "convex/_generated/dataModel";
import CustomCard from "../shared/cards/CustomCard";
import MemberCardMod from "./MemberCardMod";

interface UsersByOrgForModContentProps {
  users: Doc<"users">[];
  slug: string;
  page: string;
}

const UsersByOrgForModContent = ({
  users,
  slug,
  page,
}: UsersByOrgForModContentProps) => {
  return (
    <CustomCard className="p-0">
      {users.map((member) => (
        <MemberCardMod
          key={member.clerkUserId}
          user={member}
          slug={slug}
          page={page}
        />
      ))}
    </CustomCard>
  );
};

export default UsersByOrgForModContent;
