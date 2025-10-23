const ProfileSkeleton = () => {
  return (
    <div className="p-6 rounded-xl bg-black border border-zinc-800 w-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-6 h-6 bg-zinc-700 animate-pulse rounded-full" />
        <div className="w-32 h-6 bg-zinc-700 animate-pulse rounded" />
      </div>

      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-zinc-700 animate-pulse mb-4" />
        <div className="w-40 h-6 bg-zinc-700 animate-pulse rounded mb-6" />
      </div>

      <div className="mb-4">
        <div className="w-64 h-5 bg-zinc-700 animate-pulse rounded" />
      </div>

      <div>
        <div className="w-40 h-5 bg-zinc-700 animate-pulse rounded" />
      </div>
    </div>
  );
};

export default ProfileSkeleton;
