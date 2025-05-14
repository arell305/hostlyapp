import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import CustomCard from "@/components/shared/cards/CustomCard";
import NProgress from "nprogress";

interface ErrorComponentProps {
  message?: string;
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
