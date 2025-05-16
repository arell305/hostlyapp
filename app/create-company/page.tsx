"use client";
import { useClerk, useSession } from "@clerk/nextjs";
import CreateCompanyContent from "./CreateCompanyContent";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import { useRouter } from "next/navigation";
import MessagePage from "@/components/shared/shared-page/MessagePage";

const CreateCompanyPage = () => {
  const { organization, loaded, setActive } = useClerk();
  const { session, isLoaded } = useSession();
  const router = useRouter();

  const navigateToApp = (slug: string) => {
    router.push(`/redirecting`);
  };

  const navigateToHome = () => {
    router.push("/");
  };

  if (!isLoaded || !loaded || organization === undefined) {
    return <FullLoading />;
  }

  if (!session) {
    return (
      <MessagePage
        title="Session not found"
        description="Please go to the home page to continue"
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
