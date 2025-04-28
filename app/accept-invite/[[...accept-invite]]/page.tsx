import StaticPageContainer from "@/components/shared/containers/StaticPageContainer";
import { SignUp } from "@clerk/nextjs";

const AcceptInvitePage = () => {
  return (
    <StaticPageContainer>
      <SignUp />
    </StaticPageContainer>
  );
};

export default AcceptInvitePage;
