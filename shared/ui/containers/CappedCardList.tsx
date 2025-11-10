import { cn } from "@/shared/lib/utils";

interface CappedCardListProps {
  children: React.ReactNode;
  className?: string;
}

const CappedCardList: React.FC<CappedCardListProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 max-h-[60vh] overflow-y-auto p-1",
        className
      )}
    >
      {children}
    </div>
  );
};

export default CappedCardList;
