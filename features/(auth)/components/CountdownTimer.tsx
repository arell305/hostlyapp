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

  const format = (num: number) => String(num).padStart(2, "0");

  return (
    <div className={`flex flex-col items-center text-white ${className}`}>
      <p className="text-sm text-blue-400 tracking-widest mb-2">
        CHECKOUT TIMER
      </p>

      <div className="flex space-x-2 text-[40px] sm:text-[48px] font-bold">
        <span>{format(minutes)}</span>
        <span>:</span>
        <span>{format(seconds)}</span>
      </div>

      <div className="flex space-x-8 mt-1 text-xs sm:text-sm text-gray-400 tracking-wide">
        <span>MINUTES</span>
        <span>SECONDS</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
