import { Skeleton } from "@/components/ui/skeleton";

export function CalendarLoading() {
  return (
    <>
      <div className="mbsc-col-sm-12 mbsc-col-md-4 max-w-[800px]">
        <Skeleton className="h-80 w-full mb-4" />{" "}
      </div>

      <div className="selected-date mt-4">
        <Skeleton className="h-6 w-1/3" /> <Skeleton className="h-6 w-1/3" />{" "}
        <Skeleton className="h-6 w-1/3" /> <Skeleton className="h-6 w-1/3" />{" "}
      </div>
    </>
  );
}
