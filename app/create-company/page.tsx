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
    router.push(`/${slug}/app`);
  };

  const navigateToHome = () => {
    router.push("/");
  };

  if (!isLoaded || !loaded) {
    return <FullLoading />;
  }

  if (organization) {
    return (
      <MessagePage
        title="Organization already created"
        description="Please go to the home page to continue"
        buttonLabel="Home"
        onButtonClick={navigateToHome}
      />
    );
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
    />
  );
};

export default CreateCompanyPage;
