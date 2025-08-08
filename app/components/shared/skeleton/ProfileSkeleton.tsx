const ProfileSkeleton = () => {
  return (
    <div className="p-6 rounded-xl bg-black border border-zinc-800 w-full">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 mb-6">
        {/* Back Arrow Skeleton */}
        <div className="w-6 h-6 bg-zinc-700 animate-pulse rounded-full" />
        {/* Title Skeleton (e.g., "Team Member") */}
        <div className="w-32 h-6 bg-zinc-700 animate-pulse rounded" />
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-col items-center">
        {/* Avatar Skeleton */}
        <div className="w-24 h-24 rounded-full bg-zinc-700 animate-pulse mb-4" />

        {/* Name Skeleton */}
        <div className="w-40 h-6 bg-zinc-700 animate-pulse rounded mb-6" />
      </div>

      {/* Email Field Skeleton */}
      <div className="mb-4">
        <div className="w-64 h-5 bg-zinc-700 animate-pulse rounded" />
      </div>

      {/* Role Field Skeleton */}
      <div>
        <div className="w-40 h-5 bg-zinc-700 animate-pulse rounded" />
      </div>
    </div>
  );
};

export default ProfileSkeleton;
