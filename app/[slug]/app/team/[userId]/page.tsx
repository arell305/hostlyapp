"use client";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { QueryState } from "@/types/enums";
import UserIdContent from "./UserIdContent";
import { useUser } from "@clerk/nextjs";
import FullLoading from "../../components/loading/FullLoading";
import { Id } from "../../../../../convex/_generated/dataModel";
import { handleQueryState } from "../../../../../utils/handleQueryState";
import { isManager } from "../../../../../utils/permissions";
import { useRouter } from "next/navigation";

const UserPage = () => {
  const params = useParams();
  const userId = params.userId as Id<"users">;
  const router = useRouter();

  const { user } = useUser();
  const userFromDb = useQuery(
    api.users.findUserById,
    userId ? { userId } : "skip"
  );

  const handleBack = () => {
    router.back();
  };

  const result = handleQueryState(userFromDb);

  if (result.type === QueryState.Loading || result.type === QueryState.Error) {
    return result.element;
  }

  if (!user) {
    return <FullLoading />;
  }

  const orgRole = user?.publicMetadata.role as string;
  const canEditUsers = isManager(orgRole);
  const userData = result.data.user;

  return (
    <UserIdContent
      userData={userData}
      canEditUsers={canEditUsers}
      handleBack={handleBack}
    />
  );
};

export default UserPage;
