import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import ProfileSkeleton from "@/components/shared/skeleton/ProfileSkeleton";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import { ResponseStatus } from "@/types/enums";

export const useUserFromDb = (userId: Id<"users"> | null) => {
  const userFromDb = useQuery(
    api.users.findUserById,
    userId ? { userId } : "skip"
  );

  if (userFromDb === undefined) {
    return { component: <ProfileSkeleton />, user: null };
  }

  if (userFromDb?.status === ResponseStatus.ERROR) {
    return {
      component: (
        <ErrorComponent
          message={`${userFromDb.error || "An error occurred"}. `}
        />
      ),
      user: null,
    };
  }

  return { component: null, user: userFromDb.data.user };
};
