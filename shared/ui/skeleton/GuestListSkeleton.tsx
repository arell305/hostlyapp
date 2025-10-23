import { cn } from "@/shared/lib/utils";

interface GuestListSkeletonProps {
  className?: string;
}

const GuestListSkeleton: React.FC<GuestListSkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "p-4 rounded-xl bg-black border border-zinc-800 w-full",
        className
      )}
    >
      <div className="w-full h-10 bg-zinc-700 animate-pulse rounded mb-6" />

      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="flex justify-between items-center border-b border-zinc-800 py-4"
        >
          <div>
            <div className="w-40 h-5 bg-zinc-700 animate-pulse rounded mb-2" />
            <div className="w-24 h-4 bg-zinc-700 animate-pulse rounded" />
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 bg-zinc-700 animate-pulse rounded-full" />
            <div className="w-6 h-6 bg-zinc-700 animate-pulse rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default GuestListSkeleton;
