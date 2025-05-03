import React from "react";
import { PromoterGuestsData } from "@/types/convex-types";
import CheckInProgressBar from "@/components/shared/analytics/CheckInProgressBar";
import CustomCard from "@/components/shared/cards/CustomCard";
interface PromoterGuestsListDataProps {
  guestListResults: PromoterGuestsData;
}

const PromoterGuestsListData: React.FC<PromoterGuestsListDataProps> = ({
  guestListResults,
}) => {
  const {
    totalGuests,
    totalCheckedIn,
    totalMalesCheckedIn,
    totalFemalesCheckedIn,
  } = guestListResults;

  return (
    <CustomCard className="p-4 space-y-4 w-full ">
      <CheckInProgressBar checkedIn={totalCheckedIn} total={totalGuests} />

      <div className="flex justify-between items-center">
        <span className="text-grayText">Males Checked In</span>
        <p>{totalMalesCheckedIn}</p>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-grayText">Females Checked In</span>
        <p>{totalFemalesCheckedIn}</p>
      </div>
    </CustomCard>
  );
};

export default PromoterGuestsListData;
