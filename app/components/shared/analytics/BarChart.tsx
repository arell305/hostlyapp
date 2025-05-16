"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import React, { useState } from "react";
import CustomCard from "../cards/CustomCard";
import Heading2 from "../headings/h2";
import MessageCard from "../cards/MessageCard";

interface BarChartContainerProps<T> {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  barLabel?: string;
  title: string;
  tooltipFormatter?: (value: number) => string;
  valueFormatter?: (value: number) => string;
  barKeys: (keyof T)[];
  emptyDescription?: string;
}

const BarChartContainer = <T extends Record<string, any>>({
  data,
  xKey,
  yKey,
  barLabel,
  title,
  tooltipFormatter = (value: number) => `$${value.toFixed(2)}`,
  valueFormatter = (value: number) => `$${value.toFixed(2)}`,
  barKeys = [],
  emptyDescription = "No chart data available for this period.",
}: BarChartContainerProps<T>) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const CustomBar = (props: any) => {
    const { x, y, width, height, index, fill } = props;
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={4}
          ry={4}
          fill={fill}
          cursor="pointer"
          onClick={() => setSelectedIndex(index)}
          style={{ transition: "none" }}
        />
      </g>
    );
  };

  const getBarName = (key: string) => {
    if (key === "male") return "Male";
    if (key === "female") return "Female";
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  const getBarColor = (key: string) => {
    if (key === "male") return "#3B82F6";
    if (key === "female") return "#EC4899";
    return "#10B981";
  };

  if (data.length === 0) {
    return <MessageCard title={title} description={emptyDescription} />;
  }

  return (
    <CustomCard className="p-4">
      <Heading2>{title}</Heading2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis
            dataKey={xKey as string}
            tick={{ fontSize: 12, fill: "#f3f4f6" }}
            interval="preserveStartEnd"
            minTickGap={0}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#f3f4f6" }}
            tickFormatter={valueFormatter}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              borderRadius: "0.375rem",
            }}
            labelStyle={{ color: "#f3f4f6" }}
            formatter={(value) => tooltipFormatter(Number(value))}
            cursor={{ fill: "#1f2937" }}
          />
          <Legend
            verticalAlign="top"
            iconType="circle"
            wrapperStyle={{
              color: "#f3f4f6",
              fontSize: "14px",
              paddingBottom: "14px",
            }}
          />
          {barKeys.map((key) => {
            const keyStr = String(key);
            return (
              <Bar
                key={keyStr}
                dataKey={keyStr}
                name={getBarName(keyStr)}
                fill={getBarColor(keyStr)}
                shape={<CustomBar />}
                barSize={30}
                isAnimationActive={false}
                activeBar={false}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </CustomCard>
  );
};

export default BarChartContainer;
