import StaticPageContainer from "@/shared/ui/containers/StaticPageContainer";
import { SignUp } from "@clerk/nextjs";

const AcceptInvitePage = () => {
  return (
    <StaticPageContainer className="h-100dvh flex items-center justify-center">
      <SignUp
        afterSignOutUrl="/sign-up-redirecting"
        signInFallbackRedirectUrl="/sign-up-redirecting"
      />
    </StaticPageContainer>
  );
};

export default AcceptInvitePage;
