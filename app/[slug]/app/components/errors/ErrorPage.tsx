"use client";
import MessageCard from "@/components/shared/cards/MessageCard";
import StaticPageContainer from "@/components/shared/containers/StaticPageContainer";
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
    <StaticPageContainer>
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
    </StaticPageContainer>
  );
};

export default ErrorPage;
