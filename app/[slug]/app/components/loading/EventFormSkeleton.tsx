import { Skeleton } from "@/components/ui/skeleton";

const EventFormSkeleton = () => {
  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" /> {/* Skeleton for Label */}
        <Skeleton className="h-10 w-full max-w-[500px]" />{" "}
        {/* Skeleton for Input */}
      </div>

      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" /> {/* Skeleton for Label */}
        <Skeleton className="h-32 w-full max-w-[500px]" />{" "}
        {/* Skeleton for Textarea */}
      </div>

      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" /> {/* Skeleton for Label */}
        <Skeleton className="h-12 w-full max-w-[500px]" />{" "}
        {/* Skeleton for Calendar/Date Picker */}
      </div>

      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" /> {/* Skeleton for Label */}
        <Skeleton className="h-10 w-full max-w-[500px]" />{" "}
        {/* Skeleton for Input */}
      </div>

      {/* Repeat the pattern for other sections like ticket and guest list */}

      <div className="flex justify-end space-x-4">
        <Skeleton className="h-10 w-24" /> {/* Skeleton for Button */}
        <Skeleton className="h-10 w-24" /> {/* Skeleton for Button */}
      </div>
    </form>
  );
};

export default EventFormSkeleton;
