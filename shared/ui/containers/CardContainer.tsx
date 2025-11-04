import { cn } from "@/shared/lib/utils";

interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
}

const CardContainer: React.FC<CardContainerProps> = ({
  children,
  className,
}) => {
  return <div className={cn("flex flex-col gap-4", className)}>{children}</div>;
};

export default CardContainer;
