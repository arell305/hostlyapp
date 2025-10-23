"use client";
import { cn } from "@/shared/lib/utils";
import CustomCard from "@shared/ui/cards/CustomCard";

interface GuestListRulesCardProps {
  rules: string | null;
  className?: string;
}

const GuestListRulesCard: React.FC<GuestListRulesCardProps> = ({
  rules,
  className,
}) => {
  if (!rules) {
    return null;
  }

  return (
    <CustomCard className={cn("w-[95%] py-3 px-4 shadow mx-auto", className)}>
      <h2 className="text-2xl font-bold mb-3 text-start">
        Guest List Promotion
      </h2>
      <p className="text-base md:text-sm">{rules}</p>
    </CustomCard>
  );
};

export default GuestListRulesCard;
