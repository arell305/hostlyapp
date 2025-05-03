"use client";

import { BarChart, Bar, Cell, XAxis } from "recharts";

interface CheckInProgressBarProps {
  total: number;
  checkedIn: number;
}

const CheckInProgressBar: React.FC<CheckInProgressBarProps> = ({
  total,
  checkedIn,
}) => {
  const data = [
    {
      name: "Checked-in",
      value: checkedIn,
    },
    {
      name: "Remaining",
      value: Math.max(total - checkedIn, 0),
    },
  ];

  return (
    <div className="w-full max-w-xs">
      <div className="flex justify-between text-sm text-gray-300 mb-1">
        <span>Checked-in</span>
        <span>
          {checkedIn}/{total}
        </span>
      </div>
      <BarChart
        width={250}
        height={10}
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
      >
        <Bar dataKey="value" isAnimationActive={false} barSize={10}>
          <Cell fill="#3B82F6" /> {/* blue-500 */}
          <Cell fill="#1F2937" /> {/* gray-800 background for remaining */}
        </Bar>
      </BarChart>
    </div>
  );
};

export default CheckInProgressBar;
