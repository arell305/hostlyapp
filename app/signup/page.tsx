import SuspenseBoundary from "@/components/layout/SuspenseBoundary";
import PaymentForm from "./PaymentForm";

const SignUpPage = () => {
  return (
    <div className="bg-gradient-to-b from-customDarkBlue to-customPrimaryBlue min-h-[calc(100dvh)] flex justify-center items-center overflow-hidden">
      <SuspenseBoundary>
        <PaymentForm />
      </SuspenseBoundary>
    </div>
  );
};

export default SignUpPage;
