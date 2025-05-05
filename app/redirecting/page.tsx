"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useOrganizationList, useOrganization } from "@clerk/nextjs";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { ResponseStatus } from "@/types/enums";

const RedirectingPage = () => {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const { setActive } = useOrganizationList();
  const { organization, isLoaded: organizationLoaded } = useOrganization();
  const [error, setError] = useState(false);

  const organizationResponse = useQuery(
    api.organizations.getOrganizationByClerkUserId,
    user && userLoaded ? { clerkUserId: user.id } : "skip"
  );

  useEffect(() => {
    const redirect = async () => {
      console.log("user", user);
      console.log("userLoaded", userLoaded);
      console.log("organizationLoaded", organizationLoaded);
      console.log("organizationResponse", organizationResponse);
      if (!userLoaded || !organizationLoaded) {
        return;
      }

      if (!user) {
        router.push("/sign-in");
        return;
      }

      if (!organizationResponse || !setActive) {
        return;
      }

      if (organizationResponse.status === ResponseStatus.ERROR) {
        console.error(organizationResponse.error);
        setError(true);
        return;
      }

      const { organization: orgData } = organizationResponse.data;

      if (!orgData.isActive) {
        router.push("/unauthorized");
        return;
      }

      if (organization) {
        router.push(`/${orgData.slug}/app`);
        return;
      }

      await setActive({ organization: orgData.clerkOrganizationId });
      router.push(`/${orgData.slug}/app`);
    };

    redirect();
  }, [
    user,
    userLoaded,
    organizationLoaded,
    organizationResponse,
    setActive,
    organization,
    router,
  ]);

  if (error) {
    return (
      <ErrorComponent message="User has no org memberships or session failed." />
    );
  }

  return <FullLoading />;
};

export default RedirectingPage;
