import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SubErrorComponentProps {
  message?: string;
}

const SubErrorComponent: React.FC<SubErrorComponentProps> = ({
  message = "Error loading data",
}) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen text-center px-6">
      <p className="text-lg text-gray-600 mb-6">{message}</p>
    </div>
  );
};

export default SubErrorComponent;
