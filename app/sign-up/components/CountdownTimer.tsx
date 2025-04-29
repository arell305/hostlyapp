import React from "react";
import { useTimer } from "react-timer-hook";

interface CountdownTimerProps {
  expiryTimestamp: Date;
  className?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiryTimestamp,
  className = "",
}) => {
  const { seconds, minutes } = useTimer({ expiryTimestamp });

  return (
    <div className={`flex justify-end ${className}`}>
      <ul className="flex space-x-2  w-[180px] justify-center rounded border">
        <li className="p-2 text-3xl">{minutes}</li>
        <li className="text-3xl">:</li>
        <li className="p-2 text-3xl">{seconds.toString().padStart(2, "0")}</li>
      </ul>
    </div>
  );
};

export default CountdownTimer;
