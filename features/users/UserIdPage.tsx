"use client";
import { isManager } from "@shared/utils/permissions";
import { useRouter } from "next/navigation";
import FindUserById from "@/features/users/components/FindUserById";
import { useContextOrganization } from "@/shared/hooks/contexts";
import { Id } from "@/convex/_generated/dataModel";

interface UserPageProps {
  userId: Id<"users">;
}
const UserPage = ({ userId }: UserPageProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const canEditUsers = isManager(useContextOrganization().orgRole);

  return (
    <FindUserById
      canEditUsers={canEditUsers}
      handleBack={handleBack}
      userId={userId}
    />
  );
};

export default UserPage;
