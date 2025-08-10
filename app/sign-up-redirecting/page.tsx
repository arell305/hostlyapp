"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useOrganizationList } from "@clerk/nextjs";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { UserRole, ResponseStatus } from "@/types/enums";
import NProgress from "nprogress";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import MessagePage from "@/components/shared/shared-page/MessagePage";

const MAX_POLLS = 6;
const POLL_INTERVAL = 1000; // 1 second

const RedirectingSignUpPage = () => {
  console.log("RedirectingSignUpPage");
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const { setActive, isLoaded: orgListLoaded } = useOrganizationList();

  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const orgRole = user?.publicMetadata.role as UserRole | undefined;

  const organizationResponse = useQuery(
    api.organizations.getOrganizationByClerkUserId,
    user ? { clerkUserId: user.id } : "skip"
  );

  useEffect(() => {
    const redirectUser = async () => {
      if (!userLoaded || !orgListLoaded || organizationResponse === undefined)
        return;

      if (!user) {
        setError("User not found. Please sign in again.");
        return;
      }

      if (organizationResponse.status === ResponseStatus.ERROR) {
        setError("Failed to fetch organization.");
        return;
      }

      const { organization: orgData } = organizationResponse.data;

      if (!orgData && orgRole === UserRole.Admin) {
        NProgress.start();
        router.push("/create-company");
        return;
      }

      if (!orgData && pollCount < MAX_POLLS) {
        setTimeout(() => setPollCount((prev) => prev + 1), POLL_INTERVAL);
        return;
      }

      if (!orgData) {
        setError("No organization found. Please contact support.");
        return;
      }

      try {
        await setActive({ organization: orgData.clerkOrganizationId });
      } catch (err) {
        setError("Failed to activate organization.");
        return;
      }

      NProgress.start();

      if (
        orgRole === UserRole.Hostly_Admin ||
        orgRole === UserRole.Hostly_Moderator
      ) {
        router.push(`/${orgData.slug}/app/companies`);
      } else {
        router.push(`/${orgData.slug}/app`);
      }
    };

    if (!error) redirectUser();
  }, [
    user,
    userLoaded,
    organizationResponse,
    orgListLoaded,
    orgRole,
    setActive,
    router,
    error,
    pollCount, // include polling state
  ]);

  if (error) {
    return (
      <MessagePage
        title="Redirect Error"
        description={error}
        buttonLabel="Home"
        onButtonClick={() => router.push("/")}
      />
    );
  }

  return <FullLoading />;
};

export default RedirectingSignUpPage;
