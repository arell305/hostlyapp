import { cn } from "@/lib/utils"; // should wrap twMerge + clsx

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("space-y-4 pt-2 pb-10", className)}>{children}</div>
  );
};

export default PageContainer;
