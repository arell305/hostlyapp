import { SignIn } from "@clerk/nextjs";
import StaticPageContainer from "@shared/ui/containers/StaticPageContainer";

const SignInPage = () => {
  return (
    <StaticPageContainer className="h-[100dvh]">
      <SignIn />
    </StaticPageContainer>
  );
};

export default SignInPage;
