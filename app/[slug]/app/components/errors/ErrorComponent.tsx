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
    <div className="flex flex-col justify-center items-center h-dvh text-center px-6 overflow-hidden">
      <h1 className="text-3xl font-bold  mb-8">{message}</h1>
      <Button onClick={() => router.push("/")} className="px-6 py-2">
        Home
      </Button>
    </div>
  );
};

export default ErrorComponent;
