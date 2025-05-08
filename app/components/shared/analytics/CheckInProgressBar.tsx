"use client";

interface CheckInProgressBarProps {
  total: number;
  checkedIn: number;
}

const CheckInProgressBar: React.FC<CheckInProgressBarProps> = ({
  total,
  checkedIn,
}) => {
  const progress = total > 0 ? (checkedIn / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-300 mb-1">
        <span>Checked-in</span>
        <span>
          {checkedIn}/{total}
        </span>
      </div>
      <div className="w-full h-2 rounded bg-gray-800 overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default CheckInProgressBar;
