import { useFindUserById } from "@/hooks/convex/users";
import React from "react";
import ProfileSkeleton from "../shared/skeleton/ProfileSkeleton";
import { Id } from "convex/_generated/dataModel";
import UserIdContent from "@/[slug]/app/team/[userId]/UserIdContent";

interface FindUserByIdProps {
  userId: Id<"users">;
  canEditUsers: boolean;
  handleBack: () => void;
}
const FindUserById = ({
  userId,
  canEditUsers,
  handleBack,
}: FindUserByIdProps) => {
  const user = useFindUserById(userId);

  if (!user) {
    return <ProfileSkeleton />;
  }
  return (
    <UserIdContent
      user={user}
      canEditUsers={canEditUsers}
      handleBack={handleBack}
    />
  );
};

export default FindUserById;
