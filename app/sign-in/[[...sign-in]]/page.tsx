import StaticPageContainer from "@/components/shared/containers/StaticPageContainer";
import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <StaticPageContainer className="h-[100dvh]">
      <SignIn />
    </StaticPageContainer>
  );
};

export default SignInPage;
