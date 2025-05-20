const SkeletonMemberCard: React.FC = () => {
  return (
    <div className="h-[95px] border-b w-full px-4 py-3 flex items-center gap-4 animate-pulse bg-cardBackground">
      <div className="w-16 h-16 rounded-full bg-gray-700" />
      <div className="flex flex-col justify-center flex-1">
        <div className="h-4 w-1/2 bg-gray-700 rounded mb-2" />
        <div className="h-3 w-1/3 bg-gray-600 rounded" />
      </div>
      <div className="w-6 h-6 rounded-full bg-gray-800 ml-auto" />
    </div>
  );
};

export default SkeletonMemberCard;
