import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ErrorComponentProps {
  message?: string;
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({
  message = "Something went wrong.",
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center items-center mt-10 text-center px-6 overflow-hidden">
      <h2 className="  mb-8">{message}</h2>
      <Button onClick={() => router.push("/")} className="px-6 py-2">
        Home
      </Button>
    </div>
  );
};

export default ErrorComponent;
