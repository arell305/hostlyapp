import StaticPageContainer from "@/components/shared/containers/StaticPageContainer";
import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <StaticPageContainer>
      <SignIn />
    </StaticPageContainer>
  );
};

export default SignInPage;
