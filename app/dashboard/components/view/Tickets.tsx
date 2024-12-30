import { Input } from "@/components/ui/input";
import { TicketInfo } from "@/types/types";
import React, { useState } from "react";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
import { formatCurrency } from "../../../../utils/helpers";

interface TicketViewProps {
  ticketData?: TicketInfo | null;
}

const TicketView: React.FC<TicketViewProps> = ({ ticketData }) => {
  const [maleCount, setMaleCount] = useState<number>(0);
  const [femaleCount, setFemaleCount] = useState<number>(0);

  if (ticketData) {
    return (
      <div className="flex flex-col  rounded border border-altGray w-[400px] p-3 shadow">
        <h2 className="text-2xl font-bold mb-2 text-center md:text-start">
          Tickets
        </h2>
        <div className="flex justify-between border-b border-altGray py-2">
          <div>
            <h3 className="font-semibold font-raleway">Male Tickets</h3>
            <p className="text-sm text-altBlack">
              {formatCurrency(ticketData.maleTicketPrice)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CiCircleMinus
              className="text-3xl hover:cursor-pointer"
              onClick={() => setMaleCount(Math.max(0, maleCount - 1))}
            />
            <p className="text-xl w-8 text-center">{maleCount}</p>
            <CiCirclePlus
              className="text-3xl hover:cursor-pointer"
              onClick={() => setMaleCount(maleCount + 1)}
            />
          </div>
        </div>
        <div className="flex justify-between border-b border-altGray py-2">
          <div>
            <h3 className="font-semibold font-raleway">Female Tickets</h3>
            <p className="text-sm text-altBlack">
              {formatCurrency(ticketData.maleTicketPrice)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CiCircleMinus
              className="text-3xl hover:cursor-pointer"
              onClick={() => setFemaleCount(Math.max(0, femaleCount - 1))}
            />
            <p className="text-xl w-8 text-center">{femaleCount}</p>
            <CiCirclePlus
              className="text-3xl hover:cursor-pointer"
              onClick={() => setFemaleCount(femaleCount + 1)}
            />
          </div>
        </div>
      </div>
    );
  }
};

export default TicketView;
