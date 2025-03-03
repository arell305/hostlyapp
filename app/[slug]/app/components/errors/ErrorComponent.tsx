import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ErrorComponentProps {
  message?: string;
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({
  message = "An unexpected error occurred. Please try again later.",
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center items-center h-screen text-center px-6">
      <h1 className="text-3xl font-bold text-red-500 mb-4">
        Something went wrong
      </h1>
      <p className="text-lg text-gray-600 mb-6">{message}</p>
      <Button onClick={() => router.push("/")} className="px-6 py-2">
        Home
      </Button>
    </div>
  );
};

export default ErrorComponent;
