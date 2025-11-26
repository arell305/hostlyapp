"use client";

import SubPageContainer from "@shared/ui/containers/SubPageContainer";
import SkeletonLine from "./SkeletonLine";

const EventDetailsSkeleton = () => {
  return (
    <SubPageContainer>
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="mb-1 font-medium text-lg">Event Details</h2>

          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex gap-6">
              <div className="flex-1 space-y-3">
                <SkeletonLine width="w-64" className="bg-zinc-700" />

                <SkeletonLine width="w-56" className="bg-zinc-700" />

                <SkeletonLine width="w-72" className="bg-zinc-700 opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SubPageContainer>
  );
};

export default EventDetailsSkeleton;
