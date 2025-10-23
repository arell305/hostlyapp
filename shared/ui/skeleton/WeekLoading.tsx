import { cn } from "@/shared/lib/utils";
import CustomCard from "../cards/CustomCard";

const WeekViewLoading = ({ className }: { className?: string }) => {
  return (
    <CustomCard className={cn("py-2 px-2", className)}>
      <div className="relative w-full h-24 rounded-md ">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-zinc-600 border-t-transparent animate-spin" />
        </div>
      </div>
    </CustomCard>
  );
};

export default WeekViewLoading;
