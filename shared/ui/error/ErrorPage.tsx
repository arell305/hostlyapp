"use client";
import MessageCard from "@/shared/ui/cards/MessageCard";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";

interface ErrorPageProps {
  title?: string;
  description?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again later or return to the homepage.",
}) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen px-2 -translate-y-[100px]">
      <MessageCard
        title={title}
        description={description}
        buttonLabel="Return Home"
        onButtonClick={() => {
          NProgress.start();
          router.push("/");
        }}
        className="max-w-[700px]"
      />
    </div>
  );
};

export default ErrorPage;
