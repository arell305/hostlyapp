import { SignIn, useUser } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="bg-gradient-to-b from-customDarkBlue to-customPrimaryBlue min-h-[calc(100dvh)] flex justify-center items-center overflow-hidden">
      <SignIn routing="hash" />
    </div>
  );
};

export default SignInPage;
