import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useUserRole() {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const clerkUserId = user?.id;

  const userFromDb = useQuery(
    api.users.findUserByClerkId,
    clerkUserId ? { clerkUserId } : "skip"
  );

  const isLoading = !isClerkLoaded || userFromDb === undefined;

  if (isLoading) {
    return { role: null, isLoading: true, user: null };
  }

  return {
    role: userFromDb?.role ?? null,
    isLoading: false,
    user: userFromDb,
  };
}
