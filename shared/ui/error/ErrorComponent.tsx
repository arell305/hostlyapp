"use client";

import { useRouter } from "next/navigation";
import { Button } from "@shared/ui/primitive/button";
import CustomCard from "@shared/ui/cards/CustomCard";
import NProgress from "nprogress";

interface ErrorComponentProps {
  message?: string | null;
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({
  message = "Something went wrong.",
}) => {
  const router = useRouter();

  return (
    <CustomCard className="max-w-[700px] p-4">
      <h2 className="  mb-8">{message}</h2>
      <Button
        onClick={() => {
          NProgress.start();
          router.push("/");
        }}
        className="px-6 py-2"
      >
        Home
      </Button>
    </CustomCard>
  );
};

export default ErrorComponent;
