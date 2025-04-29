"use client";
import { useClerk, useSession } from "@clerk/nextjs";
import CreateCompanyContent from "./CreateCompanyContent";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
const CreateCompanyPage = () => {
  const { organization, loaded, setActive } = useClerk();
  const { session, isLoaded } = useSession();

  if (!isLoaded || !loaded) {
    return <FullLoading />;
  }

  if (organization) {
    return <p>Organization already created</p>;
  }

  if (!session) {
    return <p>Session not found</p>;
  }

  return <CreateCompanyContent setActive={setActive} session={session} />;
};

export default CreateCompanyPage;
