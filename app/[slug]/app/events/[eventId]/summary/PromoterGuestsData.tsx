import React from "react";
import { PromoterGuestStatsData } from "@/types/convex-types";
import CheckInProgressBar from "@/components/shared/analytics/CheckInProgressBar";
import CustomCard from "@/components/shared/cards/CustomCard";
interface PromoterGuestsListDataProps {
  guestListData: PromoterGuestStatsData;
}

const PromoterGuestsListData: React.FC<PromoterGuestsListDataProps> = ({
  guestListData,
}) => {
  const { totalMales, totalFemales, totalCheckedIn, totalRSVPs, promoterName } =
    guestListData;

  return (
    <CustomCard className="p-4 space-y-4 w-full ">
      <h3 className="text-lg font-bold">{promoterName}</h3>
      <CheckInProgressBar checkedIn={totalCheckedIn} total={totalRSVPs} />
      <div className="flex justify-between items-center">
        <span className="text-grayText">Males Checked In</span>
        <p>{totalMales}</p>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-grayText">Females Checked In</span>
        <p>{totalFemales}</p>
      </div>
    </CustomCard>
  );
};

export default PromoterGuestsListData;
