"use client";

import { useFindUserById } from "@/domain/users";
import { Id } from "convex/_generated/dataModel";
import UserIdContent from "@/features/users/components/UserIdContent";

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
    return;
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
