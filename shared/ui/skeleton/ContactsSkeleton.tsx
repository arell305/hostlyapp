"use client";

import CustomCard from "@/shared/ui/cards/CustomCard";
import SkeletonLine from "./SkeletonLine";

const ContactSkeleton = () => (
  <div className="border-b py-4 px-3 w-full flex justify-between items-center">
    <div className="space-y-3">
      {/* Name + phone */}
      <div className="flex items-center gap-4">
        <SkeletonLine width="w-48" height="h-6" />
        <SkeletonLine
          width="w-36"
          height="h-5"
          className="text-muted-foreground/70"
        />
      </div>

      {/* Badge */}
      <SkeletonLine width="w-24" height="h-6" className="rounded-full" />
    </div>

    {/* Actions (ellipsis) */}
    <div className="w-10 h-10 rounded-full bg-zinc-700 animate-pulse" />
  </div>
);

interface ContactsSkeletonProps {
  count?: number;
  className?: string;
}

const ContactsSkeleton: React.FC<ContactsSkeletonProps> = ({
  count = 6,
  className,
}) => {
  return (
    <CustomCard className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <ContactSkeleton key={i} />
      ))}
    </CustomCard>
  );
};

export default ContactsSkeleton;
