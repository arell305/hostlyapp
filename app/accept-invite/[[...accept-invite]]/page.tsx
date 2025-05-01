import StaticPageContainer from "@/components/shared/containers/StaticPageContainer";
import { SignUp } from "@clerk/nextjs";

const AcceptInvitePage = () => {
  return (
    <StaticPageContainer className="h-100dvh">
      <SignUp />
    </StaticPageContainer>
  );
};

export default AcceptInvitePage;
