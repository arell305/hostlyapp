"use client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { usePathname, useRouter } from "next/navigation";
import { TbAlertTriangle } from "react-icons/tb";
import NProgress from "nprogress";

interface NotificationProps {
  title: string;
  description: string;
  variant?: "customDarkBlue" | "default" | "destructive" | null;
  route?: string;
}

export function Notification({
  title,
  description,
  variant,
  route,
}: NotificationProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = () => {
    if (route) {
      NProgress.start();
      router.push(`${pathname}/${route}`);
    }
  };

  return (
    <Alert
      variant={variant}
      onClick={handleClick}
      className={
        route
          ? "cursor-pointer hover:bg-cardBackgroundHover transition-colors"
          : ""
      }
    >
      <AlertTitle className="flex gap-1">
        <TbAlertTriangle />
        {title}
      </AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
