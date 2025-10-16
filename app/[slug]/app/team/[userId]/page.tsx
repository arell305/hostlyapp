"use client";
import { notFound } from "next/navigation";
import { isManager } from "../../../../../utils/permissions";
import { useRouter } from "next/navigation";
import FindUserById from "@/components/users/FindUserById";
import { use } from "react";
import { normalizeUserId } from "@/lib/normalizeParams";
import { useContextOrganization } from "@/contexts/OrganizationContext";

interface UserPageProps {
  params: Promise<{ userId: string }>;
}
const UserPage = ({ params }: UserPageProps) => {
  const { userId: raw } = use(params);
  const userId = normalizeUserId(raw);
  const { orgRole } = useContextOrganization();
  if (!userId) {
    notFound();
  }

  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const canEditUsers = isManager(orgRole);

  return (
    <FindUserById
      canEditUsers={canEditUsers}
      handleBack={handleBack}
      userId={userId}
    />
  );
};

export default UserPage;
