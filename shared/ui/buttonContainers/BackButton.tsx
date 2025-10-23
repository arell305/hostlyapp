"use client";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";

interface BackButtonProps {
  text?: string;
  targetRoute?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  text = "Back",
  targetRoute,
}) => {
  const router = useRouter();

  const handleBackClick = () => {
    if (targetRoute) {
      NProgress.start();
      router.push(targetRoute);
    } else {
      router.back();
    }
  };

  return (
    <span
      onClick={handleBackClick}
      className="cursor-pointer text-customDarkBlue font-semibold hover:underline font-raleway text-base"
    >
      {text}
    </span>
  );
};

export default BackButton;
