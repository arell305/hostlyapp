import { cn } from "@/shared/lib/utils";

interface IconButtonContainerProps {
  children: React.ReactNode;
  className?: string;
}

const IconButtonContainer: React.FC<IconButtonContainerProps> = ({
  children,
  className,
}) => {
  return <div className={cn("flex gap-2", className)}>{children}</div>;
};

export default IconButtonContainer;
