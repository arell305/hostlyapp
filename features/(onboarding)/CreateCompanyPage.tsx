"use client";
import { useClerk, useSession, useUser } from "@clerk/nextjs";
import FullLoading from "@shared/ui/loading/FullLoading";
import { useRouter } from "next/navigation";
import MessagePage from "@shared/ui/shared-page/MessagePage";
import { UserRole } from "@shared/types/enums";
import { isAdmin } from "@/shared/utils/permissions";
import CreateCompanyContent from "@/features/(onboarding)/components/CreateCompanyContent";

const CreateCompanyPage = () => {
  const { organization, loaded, setActive } = useClerk();
  const { session, isLoaded } = useSession();
  const router = useRouter();
  const { user } = useUser();
  const orgRole = user?.publicMetadata.role as UserRole;
  const preventAccess = !isAdmin(orgRole);

  const navigateToApp = () => {
    router.push(`/redirecting`);
  };

  const navigateToHome = () => {
    router.push("/");
  };

  const navigateToSignIn = () => {
    router.push("/sign-in");
  };

  if (
    !isLoaded ||
    !loaded ||
    organization === undefined ||
    user === undefined
  ) {
    return <FullLoading />;
  }

  if (!session) {
    return (
      <MessagePage
        title="Session not found"
        description="Please go to the home page to continue."
        buttonLabel="Home"
        onButtonClick={navigateToHome}
      />
    );
  }

  if (!user) {
    return (
      <MessagePage
        title="Sign in to continue"
        description="Please sign in to continue."
        buttonLabel="Sign in"
        onButtonClick={navigateToSignIn}
      />
    );
  }

  if (preventAccess) {
    return (
      <MessagePage
        title="Unauthorized Access"
        description="You are not authorized to access this page. Please contact support if you believe this is an error."
        buttonLabel="Home"
        onButtonClick={navigateToHome}
      />
    );
  }
  return (
    <CreateCompanyContent
      setActive={setActive}
      session={session}
      navigateToApp={navigateToApp}
      organization={organization}
    />
  );
};

export default CreateCompanyPage;
