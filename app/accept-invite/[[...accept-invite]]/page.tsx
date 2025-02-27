import { SignUp } from "@clerk/nextjs";

const AcceptInvitePage = () => {
  return (
    <div className="flex justify-center items-center bg-blue-200 h-[100dvh] overflow-hidden">
      <div>
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-customDarkBlue text-white hover:bg-primary/90 h-10 px-4 py-2 rounded-[20px] ",
            },
          }}
        />
      </div>
    </div>
  );
};

export default AcceptInvitePage;
