import CustomCard from "@/components/shared/cards/CustomCard";
import clsx from "clsx";

interface GuestListRulesCardProps {
  rules: string | null;
  className?: string;
}

const GuestListRulesCard: React.FC<GuestListRulesCardProps> = ({
  rules,
  className,
}) => {
  if (!rules) return null;

  return (
    <CustomCard className={clsx("w-[95%] py-3 px-4 shadow mx-auto", className)}>
      <h2 className="text-2xl font-bold mb-3 text-start">
        Guest List Promotion
      </h2>
      <p className="text-base md:text-sm">{rules}</p>
    </CustomCard>
  );
};

export default GuestListRulesCard;
