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

  const handleBack = () => {
    router.back();
  };

  if (!user) {
    return <FullLoading />;
  }

  const orgRole = user?.publicMetadata.role as string;
  const canEditUsers = isManager(orgRole);

  return (
    <UserIdContent
      canEditUsers={canEditUsers}
      handleBack={handleBack}
      userId={userId}
    />
  );
};

export default UserPage;
