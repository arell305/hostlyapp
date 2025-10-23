"use client";

import { LuMapPin } from "react-icons/lu";
import _ from "lodash";
import { formatToEventDateTime } from "@/shared/utils/luxon";
import { getTextBeforeComma } from "@/shared/utils/helpers";

interface EventSummaryInfoProps {
  name: string;
  startTime: number;
  address: string;
}

const EventSummaryInfo: React.FC<EventSummaryInfoProps> = ({
  name,
  startTime,
  address,
}) => {
  return (
    <div className="space-y-1 mt-1">
      <p className="">{_.capitalize(name)}</p>
      <p className="text-sm ">{formatToEventDateTime(startTime)}</p>
      <p className="flex items-center space-x-1 text-sm">
        <LuMapPin className="w-4 h-4 shrink-0" />
        <span className="truncate">{getTextBeforeComma(address)}</span>
      </p>
    </div>
  );
};

export default EventSummaryInfo;
